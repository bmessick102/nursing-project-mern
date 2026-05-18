import fileDb from '../utils/fileDb'
import { generateCourseCode, timingSafeCodeEqual } from '../utils/courseCode'
import { type Course } from '../@types'

const COLLECTION = 'courses'

// Backfill `inviteCode` and `enrolledAccountIds` on existing rows so legacy
// data from before this feature keeps working without a destructive rewrite.
const normalizeCourse = (raw: any): Course => ({
  _id: raw._id,
  name: raw.name,
  code: raw.code,
  instructor: raw.instructor,
  description: raw.description,
  inviteCode: raw.inviteCode || generateCourseCode(raw.code),
  enrolledAccountIds: Array.isArray(raw.enrolledAccountIds) ? raw.enrolledAccountIds : [],
  createdAt: raw.createdAt || new Date().toISOString(),
  updatedAt: raw.updatedAt || new Date().toISOString(),
})

const readAll = (): Course[] => {
  const raw = fileDb.readCollection(COLLECTION) as any[]
  let mutated = false
  const normalized: Course[] = raw.map((r) => {
    const n = normalizeCourse(r)
    if (!r.inviteCode || !Array.isArray(r.enrolledAccountIds)) mutated = true
    return n
  })
  if (mutated) fileDb.writeCollection(COLLECTION, normalized)
  return normalized
}

const findAll = (): Course[] => readAll()

const findById = (id: string): Course | undefined => {
  return readAll().find((c) => c._id === id)
}

const findByInviteCode = (submittedCode: string): Course | undefined => {
  const code = (submittedCode || '').trim()
  if (!code) return undefined
  // traverse full list with timing-safe comparison (defense in depth)
  let match: Course | undefined
  for (const c of readAll()) {
    if (timingSafeCodeEqual(c.inviteCode, code) && !match) match = c
  }
  return match
}

const create = (
  data: Omit<Course, '_id' | 'createdAt' | 'updatedAt' | 'inviteCode' | 'enrolledAccountIds'> & {
    inviteCode?: string
    enrolledAccountIds?: string[]
  },
): Course => {
  const courses = readAll()
  const now = new Date().toISOString()
  const newCourse: Course = {
    _id: fileDb.generateId(),
    name: data.name,
    code: data.code,
    instructor: data.instructor,
    description: data.description,
    inviteCode: data.inviteCode || generateCourseCode(data.code),
    enrolledAccountIds: data.enrolledAccountIds || [],
    createdAt: now,
    updatedAt: now,
  }
  courses.push(newCourse)
  fileDb.writeCollection(COLLECTION, courses)
  return newCourse
}

const update = (id: string, patch: Partial<Course>): Course | undefined => {
  const courses = readAll()
  const idx = courses.findIndex((c) => c._id === id)
  if (idx === -1) return undefined
  courses[idx] = {
    ...courses[idx],
    ...patch,
    _id: courses[idx]._id,
    updatedAt: new Date().toISOString(),
  }
  fileDb.writeCollection(COLLECTION, courses)
  return courses[idx]
}

const regenerateCode = (id: string): Course | undefined => {
  const courses = readAll()
  const idx = courses.findIndex((c) => c._id === id)
  if (idx === -1) return undefined
  courses[idx] = {
    ...courses[idx],
    inviteCode: generateCourseCode(courses[idx].code),
    updatedAt: new Date().toISOString(),
  }
  fileDb.writeCollection(COLLECTION, courses)
  return courses[idx]
}

const addEnrollment = (id: string, accountId: string): Course | undefined => {
  const courses = readAll()
  const idx = courses.findIndex((c) => c._id === id)
  if (idx === -1) return undefined
  if (!courses[idx].enrolledAccountIds.includes(accountId)) {
    courses[idx].enrolledAccountIds = [...courses[idx].enrolledAccountIds, accountId]
    courses[idx].updatedAt = new Date().toISOString()
    fileDb.writeCollection(COLLECTION, courses)
  }
  return courses[idx]
}

const findEnrolledFor = (accountId: string): Course[] =>
  readAll().filter((c) => c.enrolledAccountIds.includes(accountId))

const initializeDefaultCourses = (): Course[] => {
  const existing = readAll()
  if (existing.length === 0) {
    console.log('Initializing default courses...')
    const defaults = [
      {
        name: 'Adult Health Nursing',
        code: 'NURS201',
        instructor: 'Dr. Jane Smith',
        description: 'Medical-surgical nursing for adults',
      },
      {
        name: 'Pediatric Nursing',
        code: 'NURS202',
        instructor: 'Dr. John Doe',
        description: 'Nursing care for children and adolescents',
      },
      {
        name: 'Critical Care Nursing',
        code: 'NURS301',
        instructor: 'Dr. Emily Johnson',
        description: 'Intensive care unit nursing',
      },
    ]
    defaults.forEach((c) => create(c))
  }
  return readAll()
}

export default {
  findAll,
  findById,
  findByInviteCode,
  create,
  update,
  regenerateCode,
  addEnrollment,
  findEnrolledFor,
  initializeDefaultCourses,
}
