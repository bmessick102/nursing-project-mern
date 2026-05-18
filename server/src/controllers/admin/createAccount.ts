import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import crypt from '../../utils/crypt'
import Account from '../../models/FileBasedAccount'
import { type AccountRole } from '../../@types'

const ALLOWED_ROLES: AccountRole[] = ['student', 'instructor', 'administrator']

const createAccount: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        username: joi.instance.string().min(3).max(40).required(),
        password: joi.instance.string().min(12).required(),
        firstName: joi.instance.string().min(1).max(80).optional(),
        lastName: joi.instance.string().min(1).max(80).optional(),
        email: joi.instance.string().email().optional(),
        role: joi.instance.string().valid(...ALLOWED_ROLES).required(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const {
      username,
      password,
      firstName,
      lastName,
      email,
      role,
    }: {
      username: string
      password: string
      firstName?: string
      lastName?: string
      email?: string
      role: AccountRole
    } = req.body

    if (Account.findOne({ username })) {
      return next({ statusCode: 400, message: 'Username already exists.' })
    }
    if (email && Account.findOne({ email })) {
      return next({ statusCode: 400, message: 'Email already exists.' })
    }

    const hash = await crypt.hash(password)
    const account = Account.create({
      username,
      password: hash,
      role,
      firstName,
      lastName,
      email,
      enrolledCourseIds: [],
      active: true,
    })
    const { password: _omit, ...safe } = account as any
    res.status(201).json({ message: 'Account created', data: safe })
  } catch (error) {
    next(error)
  }
}

export default createAccount
