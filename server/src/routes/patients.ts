import express, { type RequestHandler } from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkAdmin from '../middlewares/check-admin'
import errorHandler from '../middlewares/error-handler'
import Patient, { type Patient as PatientRecord } from '../models/FileBasedPatient'
import Course from '../models/FileBasedCourse'
import Account from '../models/FileBasedAccount'
import fileDb from '../utils/fileDb'

// Strip dangerous keys from any client-supplied object before it is spread into a
// stored document. Blocks prototype-pollution (__proto__/constructor/prototype).
const FORBIDDEN_KEYS = new Set(['__proto__', 'constructor', 'prototype'])
const sanitize = <T extends Record<string, any>>(o: T): T =>
  Object.fromEntries(Object.entries(o || {}).filter(([k]) => !FORBIDDEN_KEYS.has(k))) as T

// Per-patient array size caps — prevents unbounded growth (DoS) via repeated adds.
const MAX_ENTRIES = {
  vitals: 2000,
  labs: 5000,
  nursingNotes: 2000,
  orders: 2000,
  ioEntries: 5000,
  marEntries: 500,
  assessments: 2000,
  bradenScores: 2000,
  encounters: 2000,
}

// Inject the derived, read-only `instructorNotes` onto a student instance response:
// a live copy of the source case-study template's nursingNotes. Never persisted; the
// templateId guard means templates/legacy patients pass through untouched.
const withInstructorNotes = (patient: PatientRecord): PatientRecord => {
  if (!patient?.templateId) return patient
  const template = Patient.findById(patient.templateId)
  return { ...patient, instructorNotes: template?.nursingNotes ?? [] }
}

// True if the caller is an administrator (role-based, any data).
const isAdmin = (req: any): boolean => {
  const role = req.auth?.role
  return role === 'administrator' || role === 'admin'
}

// True if the caller is an administrator (any data) OR the course
// includes the caller's account id in its enrolled list.
const isEnrolledOrAdmin = (req: any, courseId: string): boolean => {
  if (isAdmin(req)) return true
  const accountId = req.auth?.uid
  if (!accountId) return false
  const course = Course.findById(courseId)
  return !!course && course.enrolledAccountIds.includes(accountId)
}

// Case-study availability window helpers. A template is visible to students only
// between availableFrom (inclusive) and availableUntil (inclusive through end of day).
const endOfDay = (iso: string): number => {
  const d = new Date(iso)
  d.setHours(23, 59, 59, 999)
  return d.getTime()
}
const isWithinWindow = (
  p: { availableFrom?: string; availableUntil?: string },
  now = Date.now(),
): boolean => {
  if (p.availableFrom && now < new Date(p.availableFrom).getTime()) return false
  if (p.availableUntil && now > endOfDay(p.availableUntil)) return false
  return true
}

// Per-patient authorization: a student may only read/modify patients that belong to
// a course they are enrolled in; administrators may access any patient. Applied to every
// `/:id/...` route so a valid token alone can't reach an arbitrary patient by id (prevents IDOR).
const checkPatientAccess: RequestHandler = (req, res, next) => {
  const id = req.params.id as string
  const patient = Patient.findById(id)
  if (!patient) {
    return next({ statusCode: 404, message: 'Patient not found' })
  }
  // Administrators may reach any patient (templates, instances, or legacy shared).
  if (isAdmin(req)) {
    return next()
  }
  // A case-study TEMPLATE is never reachable by a student directly — they work on
  // their own private instance (surfaced/created via the course listing).
  if (patient.isCaseStudy) {
    return next({ statusCode: 403, message: 'You do not have access to this patient.' })
  }
  // A per-student INSTANCE is reachable only by its owner, and only while that
  // student remains enrolled in the instance's course.
  if (patient.ownerAccountId) {
    if (patient.ownerAccountId === req.auth?.uid && isEnrolledOrAdmin(req, patient.courseId)) {
      return next()
    }
    return next({ statusCode: 403, message: 'You do not have access to this patient.' })
  }
  // Legacy shared patient — original behavior: enrolled students (or admins) allowed.
  if (!isEnrolledOrAdmin(req, patient.courseId)) {
    return next({ statusCode: 403, message: 'You do not have access to this patient.' })
  }
  next()
}

const router = express.Router()

// GET all patients
const getAllPatients: RequestHandler = (req, res, next) => {
  try {
    const patients = Patient.findAll()
    res.status(200).json({
      message: 'Successfully retrieved patients',
      data: patients,
    })
  } catch (error) {
    next(error)
  }
}

// GET patients by course — gated to enrolled students + administrators
const getPatientsByCourse: RequestHandler = (req, res, next) => {
  try {
    const courseId = req.params.courseId as string
    if (!isEnrolledOrAdmin(req, courseId)) {
      return next({
        statusCode: 403,
        message: 'You are not enrolled in this course.',
      })
    }
    const patients = Patient.findByCourse(courseId)

    // Administrator preview: templates + legacy patients, regardless of window.
    // Per-student instances are private working copies and are never surfaced here.
    if (isAdmin(req)) {
      const data = patients.filter((p) => !p.ownerAccountId)
      res.status(200).json({
        message: 'Successfully retrieved patients',
        data,
      })
      return
    }

    // Student view. Kept fully synchronous (no await between reading patients and
    // writing clones) so the lazy clone-on-first-read can't race itself.
    const uid = req.auth?.uid as string
    const data: typeof patients = []
    for (const p of patients) {
      if (p.isCaseStudy) {
        // Templates outside their availability window are omitted entirely.
        if (!isWithinWindow(p)) continue
        // Get-or-create this student's private instance of the template.
        let instance = Patient.findInstance(p._id, uid)
        if (!instance) {
          instance = Patient.cloneTemplateForStudent(p, uid)
        } else {
          // Defensive dedupe: if multiple instances somehow exist for this
          // template + student, prefer the earliest-created one.
          const dupes = patients.filter(
            (q) => q.templateId === p._id && q.ownerAccountId === uid,
          )
          if (dupes.length > 1) {
            instance = dupes.reduce((a, b) => (a.createdAt <= b.createdAt ? a : b))
          }
        }
        data.push(withInstructorNotes(instance))
      } else if (p.ownerAccountId) {
        // Another surface for instances would leak other students' work — the
        // instances we expose come from the template loop above. Skip here.
        continue
      } else {
        // Legacy shared patient — included as today.
        data.push(p)
      }
    }
    res.status(200).json({
      message: 'Successfully retrieved patients',
      data,
    })
  } catch (error) {
    next(error)
  }
}

// GET patient by ID
const getPatientById: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    res.status(200).json({
      message: 'Successfully retrieved patient',
      data: withInstructorNotes(patient),
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add vitals entry
const addVitals: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const vitals = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    // Defensive numeric bounds: block overflow / negative garbage without rejecting
    // legitimate clinical values (wide bounds only). Fields are optional.
    const vitalBounds: Record<string, [number, number]> = {
      temperature: [0, 200],
      temp: [0, 200],
      heartRate: [0, 1000],
      pulse: [0, 1000],
      respiratoryRate: [0, 1000],
      systolic: [0, 1000],
      diastolic: [0, 1000],
      spo2: [0, 100],
      oxygenSaturation: [0, 100],
      painScore: [0, 10],
    }
    for (const [field, [min, max]] of Object.entries(vitalBounds)) {
      if (field in vitals && vitals[field] !== null && vitals[field] !== '') {
        const val = Number(vitals[field])
        if (!Number.isFinite(val) || val < min || val > max) {
          return next({ statusCode: 400, message: `Invalid value for ${field}.` })
        }
      }
    }
    if (patient.vitals.length >= MAX_ENTRIES.vitals) {
      return next({ statusCode: 409, message: 'Vitals limit reached for this patient.' })
    }
    const vitalWithId = {
      ...vitals,
      _id: fileDb.generateId(),
    }
    patient.vitals.push(vitalWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Vitals entry added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add nursing note
const addNote: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const note = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.nursingNotes.length >= MAX_ENTRIES.nursingNotes) {
      return next({ statusCode: 409, message: 'Nursing note limit reached for this patient.' })
    }
    const noteWithId = {
      ...note,
      _id: fileDb.generateId(),
    }
    patient.nursingNotes.push(noteWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Nursing note added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Mark MAR as given
const signMAR: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const { entryId, scheduledTime } = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const marEntry = patient.marEntries.find((m) => m._id === entryId)
    if (!marEntry) {
      return next({
        statusCode: 404,
        message: 'MAR entry not found',
      })
    }
    const adminIdx = marEntry.administrations.findIndex((a) => a.scheduledTime === scheduledTime)
    if (adminIdx === -1) {
      return next({
        statusCode: 404,
        message: 'Scheduled time not found',
      })
    }
    // Idempotency: never let the same administration be signed twice.
    if (marEntry.administrations[adminIdx].status === 'given') {
      return next({
        statusCode: 409,
        message: 'This administration is already signed as given.',
      })
    }
    // Attribution: resolve the administering user from the authenticated account
    // instead of trusting a client-supplied givenBy (prevents forged attribution).
    const account = req.auth?.uid ? Account.findById(req.auth.uid) : undefined
    const givenBy = account
      ? [account.firstName, account.lastName].filter(Boolean).join(' ').trim() ||
        account.username ||
        req.auth?.uid
      : req.auth?.uid
    marEntry.administrations[adminIdx] = {
      ...marEntry.administrations[adminIdx],
      status: 'given',
      givenAt: new Date().toISOString().substring(11, 16),
      givenBy,
    }
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'MAR entry marked as given',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add order
const addOrder: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const order = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.orders.length >= MAX_ENTRIES.orders) {
      return next({ statusCode: 409, message: 'Order limit reached for this patient.' })
    }
    const orderWithId = {
      ...order,
      _id: fileDb.generateId(),
    }
    patient.orders.push(orderWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Order added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Update patient demographics / list fields
const updatePatientFields: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const allowed = [
      'allergies',
      'diagnosis',
      'medications',
      'roomNumber',
      'age',
      'gender',
      'name',
      'dischargeSummary',
    ]
    const patch: Record<string, unknown> = {}
    for (const key of allowed) {
      if (key in req.body) patch[key] = req.body[key]
    }
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const updated = Patient.update(id, patch as any)
    res.status(200).json({
      message: 'Patient updated',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add encounter (SOAP note)
const addEncounter: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const encounter = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.encounters.length >= MAX_ENTRIES.encounters) {
      return next({ statusCode: 409, message: 'Encounter limit reached for this patient.' })
    }
    const encounterWithId = {
      ...encounter,
      _id: fileDb.generateId(),
    }
    patient.encounters.push(encounterWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Encounter added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add lab result
const addLab: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const lab = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.labs.length >= MAX_ENTRIES.labs) {
      return next({ statusCode: 409, message: 'Lab limit reached for this patient.' })
    }
    const labWithId = {
      ...lab,
      _id: fileDb.generateId(),
    }
    patient.labs.push(labWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Lab result added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add multiple lab results in one request (panel quick-add)
const addLabsBatch: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const labs = req.body?.labs
    if (!Array.isArray(labs) || labs.length === 0) {
      return next({
        statusCode: 400,
        message: 'Request body must include a non-empty "labs" array.',
      })
    }
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.labs.length + labs.length > MAX_ENTRIES.labs) {
      return next({ statusCode: 409, message: 'Lab limit reached for this patient.' })
    }
    for (const lab of labs) {
      patient.labs.push({
        ...sanitize(lab),
        _id: fileDb.generateId(),
      })
    }
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: `${labs.length} lab result(s) added successfully`,
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add MAR entry (a new scheduled medication)
const addMAREntry: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const entry = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.marEntries.length >= MAX_ENTRIES.marEntries) {
      return next({ statusCode: 409, message: 'MAR entry limit reached for this patient.' })
    }
    const scheduledTimes: string[] = Array.isArray(entry.scheduledTimes)
      ? entry.scheduledTimes
      : []
    const administrations = scheduledTimes.map((t: string) => ({
      scheduledTime: t,
      status: 'due',
    }))
    const entryWithId = {
      ...entry,
      _id: fileDb.generateId(),
      scheduledTimes,
      administrations,
    }
    patient.marEntries.push(entryWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'MAR entry added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add nursing assessment
const addAssessment: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const assessment = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.assessments.length >= MAX_ENTRIES.assessments) {
      return next({ statusCode: 409, message: 'Assessment limit reached for this patient.' })
    }
    const assessmentWithId = {
      ...assessment,
      _id: fileDb.generateId(),
    }
    patient.assessments.push(assessmentWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Assessment added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add Braden score
const addBradenScore: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const score = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    if (patient.bradenScores.length >= MAX_ENTRIES.bradenScores) {
      return next({ statusCode: 409, message: 'Braden score limit reached for this patient.' })
    }
    const scoreWithId = {
      ...score,
      _id: fileDb.generateId(),
    }
    patient.bradenScores.push(scoreWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Braden score added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add I/O entry
const addIO: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const io = sanitize(req.body)
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    // Data integrity: amount must be a finite number in a sane range.
    const amount = Number(io.amount)
    if (!Number.isFinite(amount) || amount < 0 || amount > 100000) {
      return next({ statusCode: 400, message: 'Invalid I/O amount.' })
    }
    if (patient.ioEntries.length >= MAX_ENTRIES.ioEntries) {
      return next({ statusCode: 409, message: 'I/O limit reached for this patient.' })
    }
    const ioWithId = {
      ...io,
      _id: fileDb.generateId(),
    }
    patient.ioEntries.push(ioWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'I/O entry added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// --- Audit / edit / addendum / mark-in-error generic helpers ---

const AUDIT_KEYS = [
  'lastModifiedAt',
  'lastModifiedBy',
  'modifications',
  'markedInError',
  'markedInErrorReason',
  'markedInErrorBy',
  'markedInErrorAt',
  'addenda',
]

const stripAuditFields = (entry: Record<string, any>): Record<string, any> => {
  const out: Record<string, any> = {}
  for (const k of Object.keys(entry)) {
    if (!AUDIT_KEYS.includes(k)) out[k] = entry[k]
  }
  return out
}

// Maps URL :array segment to Patient property name.
const ARRAY_MAP: Record<string, keyof typeof Patient extends never ? never : string> = {
  encounters: 'encounters',
  labs: 'labs',
  vitals: 'vitals',
  io: 'ioEntries',
  notes: 'nursingNotes',
  'mar-entries': 'marEntries',
  assessments: 'assessments',
  braden: 'bradenScores',
  orders: 'orders',
}

// Entities whose `signed: true` means edit is blocked (use addendum instead).
const SIGNED_FIELD: Record<string, string | undefined> = {
  notes: 'signed',
  assessments: 'signed',
}

const resolveArray = (
  arrayKey: string,
): { propName: string } | { error: { statusCode: number; message: string } } => {
  const propName = ARRAY_MAP[arrayKey]
  if (!propName) return { error: { statusCode: 400, message: `Unknown resource '${arrayKey}'` } }
  return { propName }
}

// PUT /:id/resources/:array/:entryId — edit an existing entry
const editEntry: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const arrayKey = req.params.array as string
    const entryId = req.params.entryId as string
    const { patch, reason, modifiedBy } = req.body as {
      patch: Record<string, any>
      reason?: string
      modifiedBy?: string
    }
    const resolution = resolveArray(arrayKey)
    if ('error' in resolution) return next(resolution.error)
    const propName = resolution.propName

    const patient = Patient.findById(id) as any
    if (!patient) return next({ statusCode: 404, message: 'Patient not found' })

    const arr: any[] = patient[propName] || []
    const idx = arr.findIndex((e) => e._id === entryId)
    if (idx === -1) return next({ statusCode: 404, message: 'Entry not found' })

    const current = arr[idx]
    if (current.markedInError) {
      return next({ statusCode: 409, message: 'Entry is marked in error; cannot edit.' })
    }
    const signedField = SIGNED_FIELD[arrayKey]
    if (signedField && current[signedField]) {
      return next({
        statusCode: 409,
        message: 'Signed entries cannot be edited. Use Add Addendum instead.',
      })
    }

    // Never let a client-supplied patch forge the audit trail, resurrect an in-error
    // entry, or overwrite the id. Those transitions only happen through the dedicated
    // mark-in-error / addendum endpoints and server-managed fields below.
    const safePatch = stripAuditFields(sanitize(patch || {}))
    delete safePatch._id

    const previousSnapshot = stripAuditFields(current)
    const merged = {
      ...current,
      ...safePatch,
      _id: current._id,
      modifications: [
        ...(current.modifications || []),
        {
          modifiedAt: new Date().toISOString(),
          modifiedBy: modifiedBy || 'Current User',
          reason,
          previousSnapshot,
        },
      ],
      lastModifiedAt: new Date().toISOString(),
      lastModifiedBy: modifiedBy || 'Current User',
    }
    arr[idx] = merged
    patient[propName] = arr
    const updated = Patient.update(id, patient)
    res.status(200).json({ message: 'Entry updated', data: updated })
  } catch (error) {
    next(error)
  }
}

// POST /:id/resources/:array/:entryId/addendum — append an addendum
const addAddendum: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const arrayKey = req.params.array as string
    const entryId = req.params.entryId as string
    const { content, author, authorRole } = req.body as {
      content: string
      author?: string
      authorRole?: string
    }
    if (!content || !content.trim()) {
      return next({ statusCode: 400, message: 'Addendum content is required.' })
    }
    const resolution = resolveArray(arrayKey)
    if ('error' in resolution) return next(resolution.error)
    const propName = resolution.propName

    const patient = Patient.findById(id) as any
    if (!patient) return next({ statusCode: 404, message: 'Patient not found' })

    const arr: any[] = patient[propName] || []
    const idx = arr.findIndex((e) => e._id === entryId)
    if (idx === -1) return next({ statusCode: 404, message: 'Entry not found' })

    const current = arr[idx]
    if (current.markedInError) {
      return next({
        statusCode: 409,
        message: 'Entry is marked in error; cannot add addendum.',
      })
    }

    const addendum = {
      _id: fileDb.generateId(),
      timestamp: new Date().toISOString(),
      author: author || 'Current User',
      authorRole,
      content: content.trim(),
    }
    arr[idx] = {
      ...current,
      addenda: [...(current.addenda || []), addendum],
    }
    patient[propName] = arr
    const updated = Patient.update(id, patient)
    res.status(200).json({ message: 'Addendum appended', data: updated })
  } catch (error) {
    next(error)
  }
}

// POST /:id/resources/:array/:entryId/mark-in-error — mark an entry as documented in error
const markInError: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const arrayKey = req.params.array as string
    const entryId = req.params.entryId as string
    const { reason, markedBy } = req.body as { reason: string; markedBy?: string }
    if (!reason || !reason.trim()) {
      return next({ statusCode: 400, message: 'Reason is required to mark in error.' })
    }
    const resolution = resolveArray(arrayKey)
    if ('error' in resolution) return next(resolution.error)
    const propName = resolution.propName

    const patient = Patient.findById(id) as any
    if (!patient) return next({ statusCode: 404, message: 'Patient not found' })

    const arr: any[] = patient[propName] || []
    const idx = arr.findIndex((e) => e._id === entryId)
    if (idx === -1) return next({ statusCode: 404, message: 'Entry not found' })

    arr[idx] = {
      ...arr[idx],
      markedInError: true,
      markedInErrorReason: reason.trim(),
      markedInErrorBy: markedBy || 'Current User',
      markedInErrorAt: new Date().toISOString(),
    }
    patient[propName] = arr
    const updated = Patient.update(id, patient)
    res.status(200).json({ message: 'Entry marked in error', data: updated })
  } catch (error) {
    next(error)
  }
}

// Listing every patient across all courses is an administrator-only capability.
router.get('/', [checkBearerToken, checkAdmin], getAllPatients, errorHandler)
router.get('/course/:courseId', [checkBearerToken], getPatientsByCourse, errorHandler)

// All single-patient routes require course enrollment (or admin) for that patient.
const patientGuards = [checkBearerToken, checkPatientAccess]
router.get('/:id', patientGuards, getPatientById, errorHandler)
router.patch('/:id/vitals', patientGuards, addVitals, errorHandler)
router.patch('/:id/notes', patientGuards, addNote, errorHandler)
router.patch('/:id/mar', patientGuards, signMAR, errorHandler)
router.patch('/:id/io', patientGuards, addIO, errorHandler)
router.patch('/:id/assessments', patientGuards, addAssessment, errorHandler)
router.patch('/:id/braden', patientGuards, addBradenScore, errorHandler)
router.patch('/:id/encounters', patientGuards, addEncounter, errorHandler)
router.patch('/:id/labs', patientGuards, addLab, errorHandler)
router.patch('/:id/labs/batch', patientGuards, addLabsBatch, errorHandler)
router.patch('/:id/mar-entries', patientGuards, addMAREntry, errorHandler)
router.patch('/:id/orders', patientGuards, addOrder, errorHandler)
router.patch('/:id/demographics', patientGuards, updatePatientFields, errorHandler)

// Generic audit/edit endpoints — :array ∈ encounters | labs | vitals | io | notes | mar-entries | assessments | braden | orders
router.put('/:id/resources/:array/:entryId', patientGuards, editEntry, errorHandler)
router.post('/:id/resources/:array/:entryId/addendum', patientGuards, addAddendum, errorHandler)
router.post('/:id/resources/:array/:entryId/mark-in-error', patientGuards, markInError, errorHandler)

export default router
