import dotenv from 'dotenv'
dotenv.config()

import app from './utils/app' // (server)
import fileStorage from './utils/fileStorage' // (database)
import authRoutes from './routes/auth'
import courseRoutes from './routes/courses'
import patientRoutes from './routes/patients'
import adminRoutes from './routes/admin'
import Account from './models/FileBasedAccount'
import Course from './models/FileBasedCourse'
import Patient from './models/FileBasedPatient'
import InviteCode from './models/FileBasedInviteCode'

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

  app.get('/healthz', (req, res) => {
    res.status(204).end()
  })

  app.use('/auth', authRoutes)
  app.use('/courses', courseRoutes)
  app.use('/patients', patientRoutes)
  app.use('/admin', adminRoutes)
  // add rest of routes here...

  // Find an available port
  const preferredPort = parseInt(process.env.PORT || '5000', 10)

  const server = app.listen(preferredPort, () => {
    console.log(`✅ Server is listening on port: ${preferredPort}`)
    console.log(`📱 Frontend should connect to: http://localhost:${preferredPort}`)
  })

  // Handle port in use - try next port
  server.on('error', (error: any) => {
    if (error.code === 'EADDRINUSE') {
      console.log(`⚠️  Port ${preferredPort} is in use, trying ${preferredPort + 1}...`)
      const newPort = preferredPort + 1
      const retryServer = app.listen(newPort, () => {
        console.log(`✅ Server is listening on port: ${newPort}`)
        console.log(`📱 Update client .env to: http://localhost:${newPort}`)
      })

      retryServer.on('error', () => {
        console.error('❌ Could not find an available port. Please close other applications.')
        process.exit(1)
      })
    }
  })
}

bootstrap()
