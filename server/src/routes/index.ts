import { type Express, type Request, type Response } from 'express'
import authRoutes from './auth'
import courseRoutes from './courses'
import patientRoutes from './patients'
import adminRoutes from './admin'

/**
 * Mounts the health check and all API routers. Kept separate from server startup so
 * tests can build a configured app (via supertest) without binding a port.
 */
export const registerRoutes = (app: Express) => {
  app.get('/healthz', (_req: Request, res: Response) => {
    res.status(204).end()
  })

  app.use('/auth', authRoutes)
  app.use('/courses', courseRoutes)
  app.use('/patients', patientRoutes)
  app.use('/admin', adminRoutes)
}

export default registerRoutes
