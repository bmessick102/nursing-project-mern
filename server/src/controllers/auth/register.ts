import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import jwt from '../../utils/jwt'
import crypt from '../../utils/crypt'
import Account from '../../models/FileBasedAccount'

const register: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        username: joi.instance.string().min(3).max(40).required(),
        password: joi.instance.string().min(12).required(),
        firstName: joi.instance.string().min(1).max(80).optional(),
        lastName: joi.instance.string().min(1).max(80).optional(),
        email: joi.instance.string().email().optional(),
        // inviteCode is accepted but ignored for back-compat with older clients.
        inviteCode: joi.instance.string().optional(),
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
    }: {
      username: string
      password: string
      firstName?: string
      lastName?: string
      email?: string
    } = req.body

    // Verify account username as unique
    const foundByUsername = Account.findOne({ username })
    if (foundByUsername) {
      return next({
        statusCode: 400,
        message: 'An account already exists with that username.',
      })
    }

    // Optionally verify email uniqueness
    if (email) {
      const foundByEmail = Account.findOne({ email })
      if (foundByEmail) {
        return next({
          statusCode: 400,
          message: 'An account already exists with that email.',
        })
      }
    }

    // Hash password
    const hash = await crypt.hash(password)

    // Public self-signup is locked to the 'student' role.
    // Administrator and instructor accounts are created only by an existing
    // administrator via the admin console — this remains the only privilege-escalation
    // path even though we no longer gate signup with an invite code.
    const account = Account.create({
      username,
      password: hash,
      role: 'student',
      firstName,
      lastName,
      email,
      enrolledCourseIds: [],
      active: true,
    })

    // Issue access token
    const token = jwt.signToken({ uid: account._id, role: account.role })

    // Strip password from response
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
