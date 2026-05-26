import { type NextFunction, type Request, type Response } from 'express'
import logger from '../utils/logger'

const isProd = process.env.NODE_ENV === 'production'

const errorHandler = (error: any, _req: Request, res: Response, _next: NextFunction) => {
  const statusCode = error?.statusCode || 500

  // Log full detail server-side for debugging.
  if (statusCode >= 500) {
    logger.error({ err: error }, 'Unhandled request error')
  }

  // Client errors (4xx) carry intentional, safe messages (e.g. validation,
  // "username taken"). Server errors (5xx) must not leak internal details.
  const message =
    statusCode >= 500 ? 'Internal server error' : error?.message || 'Request failed'

  const body: Record<string, unknown> = { message }

  // Include the stack only outside production, to aid local debugging.
  if (!isProd && error?.stack) {
    body.stack = error.stack
  }

  res.status(statusCode).json(body)
}

export default errorHandler
