import { type RequestHandler } from 'express'
import jwt from '../utils/jwt'
import Account from '../models/FileBasedAccount'

const checkBearerToken: RequestHandler = (req, res, next) => {
  try {
    const token = req.headers.authorization?.split(' ')[1]

    if (!token) {
      return next({
        statusCode: 401,
        message: 'Token not provided',
      })
    }

    const auth = jwt.verifyToken(token)

    if (!auth) {
      return next({
        statusCode: 401,
        message: 'Invalid token',
      })
    }

    req.auth = typeof auth === 'string' ? JSON.parse(auth) : auth

    // Re-validate the account against the current DB state on every request.
    // A token can outlive the account being disabled or logged out, so a
    // valid signature alone is not enough to trust the session.
    const uid = req.auth?.uid

    if (!uid) {
      return next({
        statusCode: 401,
        message: 'Session is no longer valid. Please log in again.',
      })
    }

    const account = Account.findById(uid)

    if (!account || account.active === false) {
      return next({
        statusCode: 401,
        message: 'Session is no longer valid. Please log in again.',
      })
    }

    next()
  } catch (error) {
    next({
      statusCode: 401,
      message: 'Invalid token',
    })
  }
}

export default checkBearerToken
