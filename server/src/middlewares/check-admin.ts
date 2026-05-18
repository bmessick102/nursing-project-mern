import { type RequestHandler } from 'express'

/**
 * Gates an endpoint to administrator accounts only.
 * Must be chained AFTER checkBearerToken so req.auth is populated.
 *
 * Recognizes both the current 'administrator' role and the legacy 'admin'
 * role for backwards compatibility with accounts created before the role
 * union was widened.
 */
const checkAdmin: RequestHandler = (req, res, next) => {
  const role = (req as any).auth?.role
  if (role !== 'administrator' && role !== 'admin') {
    return next({
      statusCode: 403,
      message: 'Administrator access required.',
    })
  }
  next()
}

export default checkAdmin
