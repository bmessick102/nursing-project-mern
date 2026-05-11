import dotenv from 'dotenv'
dotenv.config()

import app from './utils/app' // (server)
import fileStorage from './utils/fileStorage' // (database)
import authRoutes from './routes/auth'
import courseRoutes from './routes/courses'
import patientRoutes from './routes/patients'
import Account from './models/FileBasedAccount'
import Course from './models/FileBasedCourse'
import Patient from './models/FileBasedPatient'

const bootstrap = async () => {
  await fileStorage.connect()

  // Initialize default data
  Account.initializeDefaultAccounts()
  Course.initializeDefaultCourses()
  Patient.initializeDefaultPatients()

  app.get('/', (req, res) => {
    res.status(200).send('Hello, world!')
  })

  app.get('/healthz', (req, res) => {
    res.status(204).end()
  })

  app.use('/auth', authRoutes)
  app.use('/courses', courseRoutes)
  app.use('/patients', patientRoutes)
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
