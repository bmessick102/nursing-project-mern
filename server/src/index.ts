// Must be first: loads .env before any imported module reads process.env
// (e.g. constants/index.ts, which throws if JWT_SECRET is missing).
import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import express from 'express'
import app from './utils/app' // (server)
import logger from './utils/logger'
import fileStorage from './utils/fileStorage' // (database)
import fileDb from './utils/fileDb'
import { registerRoutes } from './routes'
import Account from './models/FileBasedAccount'
import Course from './models/FileBasedCourse'
import Patient from './models/FileBasedPatient'
import InviteCode from './models/FileBasedInviteCode'

// Log fatal errors before the process exits so the platform (Railway) can record
// them and restart cleanly, instead of dying silently.
process.on('uncaughtException', (error) => {
  logger.fatal({ err: error }, 'Uncaught exception — shutting down')
  process.exit(1)
})
process.on('unhandledRejection', (reason) => {
  logger.fatal({ err: reason }, 'Unhandled promise rejection — shutting down')
  process.exit(1)
})

const bootstrap = async () => {
  // Capture whether the DB file already existed BEFORE we open/seed it. This is the
  // decisive persistence signal: if the file is fresh on every boot, the DB path is
  // NOT on a mounted volume and all data (except re-seeded defaults like the admin)
  // is wiped on each redeploy.
  const dbPath = fileDb.getDbPath()
  const dbExistedBeforeBoot = fs.existsSync(dbPath)

  await fileStorage.connect()

  // Initialize default data
  Course.initializeDefaultCourses()
  await Account.initializeDefaultAccounts()
  Patient.initializeDefaultPatients()
  InviteCode.initializeDefaultCodes()

  // --- Persistence diagnostics (visible in Railway logs) ---------------------
  // Make data-loss-on-redeploy impossible to miss. If the DB file was created fresh
  // this boot, the storage is ephemeral and will be wiped again next redeploy.
  const persistenceConfigured = Boolean(process.env.DATABASE_PATH || process.env.DATA_DIR)
  console.log(`💾 SQLite DB path: ${dbPath}`)
  if (dbExistedBeforeBoot) {
    console.log('💾 DB file existed before this boot → data PERSISTED across restart ✅')
  } else {
    console.warn(
      '💾 DB file was created fresh this boot → NO prior data found. ' +
        'If this happens on every redeploy, the DB path is NOT on a persistent volume.',
    )
  }
  if (process.env.NODE_ENV === 'production' && !persistenceConfigured) {
    console.error(
      '⚠️  PRODUCTION: neither DATABASE_PATH nor DATA_DIR is set. The SQLite file is on ' +
        'ephemeral container storage and WILL be wiped on every redeploy. ' +
        'Mount a Railway volume (e.g. at /data) and set DATABASE_PATH=/data/app.db.',
    )
  }

  // Print the current course invite codes so the admin knows what to hand out.
  // These are secret enrollment codes, so only emit them when explicitly opted in
  // via LOG_JOIN_CODES=1 — anyone with log access (e.g. Railway dashboard) could
  // otherwise harvest them.
  if (process.env.LOG_JOIN_CODES === '1') {
    const courses = Course.findAll()
    if (courses.length) {
      console.log('🔑 Course join codes:')
      for (const c of courses) {
        console.log(`   ${c.name} (${c.code}): ${c.inviteCode}`)
      }
    }
  }

  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!')
  })

  // Health check + all API routers.
  registerRoutes(app)

  // Serve the React build so the entire app runs from one port.
  // API routes above take priority; everything else falls through to the SPA.
  const clientBuild = path.join(__dirname, '../../client/build')
  app.use(express.static(clientBuild))
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientBuild, 'index.html'))
  })

  const port = parseInt(process.env.PORT || '5001', 10)

  const server = app.listen(port, () => {
    console.log(`✅ Server is listening on port: ${port}`)
    console.log(`📱 Frontend should connect to: http://localhost:${port}`)
  })

  // Fail loudly if the port is taken. Silently drifting to another port would
  // leave the frontend dev proxy (which targets this exact port) unable to connect.
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.error(
        `❌ Port ${port} is already in use. Stop whatever is using it (or set a different PORT) and restart.`,
      )
    } else {
      console.error('❌ Server failed to start:', error)
    }
    process.exit(1)
  })
}

bootstrap()
