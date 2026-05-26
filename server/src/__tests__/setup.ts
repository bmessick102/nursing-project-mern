import os from 'os'
import fs from 'fs'
import path from 'path'

// Isolate tests in a throwaway data dir so they never touch real data and skip the
// legacy-JSON import. Set required env BEFORE any app module loads (constants throws
// without JWT_SECRET).
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'nursing-test-'))

process.env.NODE_ENV = 'test'
process.env.JWT_SECRET = 'test-secret-not-for-production'
process.env.DATA_DIR = tmp
process.env.DATABASE_PATH = path.join(tmp, 'test.db')
process.env.CORS_ORIGIN = 'http://localhost:3000'
