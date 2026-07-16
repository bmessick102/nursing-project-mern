import { type RequestHandler } from 'express'

/**
 * Gates an endpoint to instructor or administrator accounts.
 * Must be chained AFTER checkBearerToken so req.auth is populated.
 *
 * Recognizes 'instructor', the current 'administrator' role, and the legacy
 * 'admin' role for backwards compatibility with accounts created before the
 * role union was widened.
 */
const checkInstructorOrAdmin: RequestHandler = (req, res, next) => {
  const role = (req as any).auth?.role
  if (role !== 'instructor' && role !== 'administrator' && role !== 'admin') {
    return next({
      statusCode: 403,
      message: 'Instructor or administrator access required.',
    })
  }
  next()
}

export default checkInstructorOrAdmin
