import express, { type RequestHandler } from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import Patient from '../models/FileBasedPatient'
import fileDb from '../utils/fileDb'

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

// GET patients by course
const getPatientsByCourse: RequestHandler = (req, res, next) => {
  try {
    const courseId = req.params.courseId as string
    const patients = Patient.findByCourse(courseId)
    res.status(200).json({
      message: 'Successfully retrieved patients',
      data: patients,
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
      data: patient,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add vitals entry
const addVitals: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const vitals = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const note = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const { entryId, scheduledTime, givenBy } = req.body
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
    const order = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const encounter = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const lab = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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

// PATCH - Add MAR entry (a new scheduled medication)
const addMAREntry: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const entry = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const assessment = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const score = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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
    const io = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
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

    const previousSnapshot = stripAuditFields(current)
    const merged = {
      ...current,
      ...patch,
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

router.get('/', [checkBearerToken], getAllPatients, errorHandler)
router.get('/course/:courseId', [checkBearerToken], getPatientsByCourse, errorHandler)
router.get('/:id', [checkBearerToken], getPatientById, errorHandler)
router.patch('/:id/vitals', [checkBearerToken], addVitals, errorHandler)
router.patch('/:id/notes', [checkBearerToken], addNote, errorHandler)
router.patch('/:id/mar', [checkBearerToken], signMAR, errorHandler)
router.patch('/:id/io', [checkBearerToken], addIO, errorHandler)
router.patch('/:id/assessments', [checkBearerToken], addAssessment, errorHandler)
router.patch('/:id/braden', [checkBearerToken], addBradenScore, errorHandler)
router.patch('/:id/encounters', [checkBearerToken], addEncounter, errorHandler)
router.patch('/:id/labs', [checkBearerToken], addLab, errorHandler)
router.patch('/:id/mar-entries', [checkBearerToken], addMAREntry, errorHandler)
router.patch('/:id/orders', [checkBearerToken], addOrder, errorHandler)
router.patch('/:id/demographics', [checkBearerToken], updatePatientFields, errorHandler)

// Generic audit/edit endpoints — :array ∈ encounters | labs | vitals | io | notes | mar-entries | assessments | braden | orders
router.put('/:id/resources/:array/:entryId', [checkBearerToken], editEntry, errorHandler)
router.post('/:id/resources/:array/:entryId/addendum', [checkBearerToken], addAddendum, errorHandler)
router.post('/:id/resources/:array/:entryId/mark-in-error', [checkBearerToken], markInError, errorHandler)

export default router
