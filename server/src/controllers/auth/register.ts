import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import jwt from '../../utils/jwt'
import crypt from '../../utils/crypt'
import Account from '../../models/FileBasedAccount'
import InviteCode from '../../models/FileBasedInviteCode'

const INVITE_ERROR_MESSAGES: Record<string, string> = {
  not_found: 'Invalid invite code. Contact your administrator for a valid code.',
  inactive: 'This invite code has been revoked. Contact your administrator.',
  expired: 'This invite code has expired. Contact your administrator.',
  exhausted: 'This invite code has reached its maximum uses. Contact your administrator.',
}

const register: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        username: joi.instance.string().min(3).max(40).required(),
        password: joi.instance.string().min(6).required(),
        firstName: joi.instance.string().min(1).max(80).optional(),
        lastName: joi.instance.string().min(1).max(80).optional(),
        email: joi.instance.string().email().optional(),
        inviteCode: joi.instance.string().min(8).max(120).required(),
      },
      req.body,
    )

    if (validationError) {
      return next(validationError)
    }

    const {
      username,
      password,
      firstName,
      lastName,
      email,
      inviteCode,
    }: {
      username: string
      password: string
      firstName?: string
      lastName?: string
      email?: string
      inviteCode: string
    } = req.body

    // 1. Validate invite code FIRST (before any account work).
    // This prevents account-existence probing and ensures role can't be forged.
    const validation = InviteCode.validate(inviteCode)
    if (!validation.ok) {
      return next({
        statusCode: 400,
        message: INVITE_ERROR_MESSAGES[validation.reason] || 'Invalid invite code.',
      })
    }
    const validCode = validation.code

    // 2. Verify account username as unique
    const foundByUsername = Account.findOne({ username })
    if (foundByUsername) {
      return next({
        statusCode: 400,
        message: 'An account already exists with that username.',
      })
    }

    // 3. Optionally verify email uniqueness
    if (email) {
      const foundByEmail = Account.findOne({ email })
      if (foundByEmail) {
        return next({
          statusCode: 400,
          message: 'An account already exists with that email.',
        })
      }
    }

    // 4. Hash password
    const hash = await crypt.hash(password)

    // 5. Create account — role is ALWAYS taken from the invite code, never req.body.
    // This blocks privilege escalation: a student code cannot create an administrator account.
    const account = Account.create({
      username,
      password: hash,
      role: validCode.role,
      firstName,
      lastName,
      email,
    })

    // 6. Atomically consume the invite code (increment useCount, record use).
    InviteCode.consume(validCode._id, {
      accountId: account._id,
      username: account.username,
      usedAt: new Date().toISOString(),
    })

    // 7. Issue access token
    const token = jwt.signToken({ uid: account._id, role: account.role })

    // 8. Strip password from response
    const { password: _, ...data } = account

    res.status(201).json({
      message: 'Successfully registered',
      data,
      token,
    })
  } catch (error) {
    next(error)
  }
}

export default register
