import fileDb from '../utils/fileDb'
import crypt from '../utils/crypt'
import { type Account } from '../@types'

interface AccountWithId extends Account {
  _id: string
  createdAt?: string
  updatedAt?: string
}

const COLLECTION = 'accounts'

const normalizeAccount = (raw: any): AccountWithId => ({
  ...raw,
  enrolledCourseIds: Array.isArray(raw.enrolledCourseIds) ? raw.enrolledCourseIds : [],
  // Default to true so accounts created before this feature stay active.
  active: typeof raw.active === 'boolean' ? raw.active : true,
})

const readAll = (): AccountWithId[] => {
  const raw = fileDb.readCollection(COLLECTION) as any[]
  return raw.map(normalizeAccount)
}

const findOne = (query: Partial<AccountWithId>) => {
  const accounts = readAll()
  return accounts.find((acc) => {
    for (const key in query) {
      if ((acc as any)[key] !== (query as any)[key]) return false
    }
    return true
  })
}

const create = (data: Omit<AccountWithId, '_id' | 'createdAt' | 'updatedAt'>) => {
  const accounts = readAll()
  const newAccount: AccountWithId = {
    enrolledCourseIds: [],
    active: true,
    ...data,
    _id: fileDb.generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  accounts.push(newAccount)
  fileDb.writeCollection(COLLECTION, accounts)
  return newAccount
}

const countByRole = (role: string): number =>
  readAll().filter((a) => a.role === role && a.active !== false).length

const findById = (id: string) => readAll().find((acc) => acc._id === id)

const findAll = () => readAll()

const update = (id: string, patch: Partial<AccountWithId>): AccountWithId | undefined => {
  const accounts = readAll()
  const idx = accounts.findIndex((a) => a._id === id)
  if (idx === -1) return undefined
  accounts[idx] = {
    ...accounts[idx],
    ...patch,
    _id: accounts[idx]._id,
    updatedAt: new Date().toISOString(),
  }
  fileDb.writeCollection(COLLECTION, accounts)
  return accounts[idx]
}

const addEnrolledCourse = (id: string, courseId: string): AccountWithId | undefined => {
  const accounts = readAll()
  const idx = accounts.findIndex((a) => a._id === id)
  if (idx === -1) return undefined
  const current = accounts[idx].enrolledCourseIds || []
  if (!current.includes(courseId)) {
    accounts[idx].enrolledCourseIds = [...current, courseId]
    accounts[idx].updatedAt = new Date().toISOString()
    fileDb.writeCollection(COLLECTION, accounts)
  }
  return accounts[idx]
}

const SEEDED_ADMIN = {
  username: process.env.ADMIN_USERNAME || 'cuw-admin',
  firstName: 'System',
  lastName: 'Administrator',
  email: 'admin@cuw.edu',
}

const initializeDefaultAccounts = async () => {
  // Ensure an initial administrator exists. The password comes from ADMIN_PASSWORD
  // (no credential is hardcoded in source). If it isn't set, we skip seeding rather
  // than fall back to a well-known password — that fallback was the vulnerability.
  const existing = findOne({ username: SEEDED_ADMIN.username })
  if (existing) return

  const password = process.env.ADMIN_PASSWORD
  if (!password) {
    console.warn(
      '⚠️  ADMIN_PASSWORD not set — skipping initial admin seeding. ' +
        'Set ADMIN_USERNAME and ADMIN_PASSWORD in the environment, then restart.',
    )
    return
  }

  const hash = await crypt.hash(password)
  create({
    username: SEEDED_ADMIN.username,
    password: hash,
    role: 'administrator',
    firstName: SEEDED_ADMIN.firstName,
    lastName: SEEDED_ADMIN.lastName,
    email: SEEDED_ADMIN.email,
    enrolledCourseIds: [],
    active: true,
  })
  console.log('✅ Seeded administrator account:')
  console.log(`   Username: ${SEEDED_ADMIN.username}`)
}

export default {
  findOne,
  findById,
  findAll,
  create,
  update,
  addEnrolledCourse,
  countByRole,
  initializeDefaultAccounts,
}
