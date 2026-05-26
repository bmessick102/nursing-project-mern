// Must be first: loads .env before any imported module reads process.env
// (e.g. constants/index.ts, which throws if JWT_SECRET is missing).
import 'dotenv/config'

import path from 'path'
import express from 'express'
import app from './utils/app' // (server)
import logger from './utils/logger'
import fileStorage from './utils/fileStorage' // (database)
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
  await fileStorage.connect()

  // Initialize default data
  Course.initializeDefaultCourses()
  await Account.initializeDefaultAccounts()
  Patient.initializeDefaultPatients()
  InviteCode.initializeDefaultCodes()

  // Print the current course invite codes so the admin knows what to hand out.
  const courses = Course.findAll()
  if (courses.length) {
    console.log('🔑 Course join codes:')
    for (const c of courses) {
      console.log(`   ${c.name} (${c.code}): ${c.inviteCode}`)
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
