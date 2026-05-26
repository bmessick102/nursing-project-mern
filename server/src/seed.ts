// Must be first: load .env before modules that read process.env at import time.
import 'dotenv/config'

import fileStorage from './utils/fileStorage'
import Account from './models/FileBasedAccount'
import Course from './models/FileBasedCourse'
import Patient from './models/FileBasedPatient'
import InviteCode from './models/FileBasedInviteCode'

/**
 * One-off seed/init: open the SQLite store (importing any legacy JSON), then ensure
 * the default courses, administrator, patients, and invite codes exist. Idempotent —
 * the initializeDefault* helpers no-op when data already exists. The admin password
 * comes from ADMIN_PASSWORD (no credential is hardcoded here).
 */
const seed = async () => {
  await fileStorage.connect()

  Course.initializeDefaultCourses()
  await Account.initializeDefaultAccounts()
  Patient.initializeDefaultPatients()
  InviteCode.initializeDefaultCodes()

  console.log('✅ Seed/init complete.')
}

seed()
  .then(() => process.exit(0))
  .catch((err) => {
    console.error('❌ Seeding failed:', err)
    process.exit(1)
  })
