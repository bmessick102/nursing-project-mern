import fileDb from '../utils/fileDb'
import { type Account } from '../@types'

interface AccountWithId extends Account {
  _id: string
  createdAt?: string
  updatedAt?: string
}

const COLLECTION = 'accounts'

const findOne = (query: Partial<AccountWithId>) => {
  const accounts = fileDb.readCollection(COLLECTION) as AccountWithId[]
  return accounts.find((acc: AccountWithId) => {
    for (const key in query) {
      if ((acc as any)[key] !== (query as any)[key]) {
        return false
      }
    }
    return true
  })
}

const create = (data: Omit<AccountWithId, '_id' | 'createdAt' | 'updatedAt'>) => {
  const accounts = fileDb.readCollection(COLLECTION) as AccountWithId[]
  const newAccount: AccountWithId = {
    ...data,
    _id: fileDb.generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  accounts.push(newAccount)
  fileDb.writeCollection(COLLECTION, accounts)
  return newAccount
}

const findById = (id: string) => {
  const accounts = fileDb.readCollection(COLLECTION) as AccountWithId[]
  return accounts.find((acc: AccountWithId) => acc._id === id)
}

const initializeDefaultAccounts = () => {
  const accounts = fileDb.readCollection(COLLECTION) as AccountWithId[]
  if (accounts.length === 0) {
    console.log('✅ Account database initialized (empty)')
  }
}

export default {
  findOne,
  create,
  findById,
  initializeDefaultAccounts,
}
