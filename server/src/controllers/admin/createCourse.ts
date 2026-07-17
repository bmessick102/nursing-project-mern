import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import Course from '../../models/FileBasedCourse'

const createCourse: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        name: joi.instance.string().min(1).max(120).required(),
        code: joi.instance.string().min(1).max(40).required(),
        instructor: joi.instance.string().max(120).allow('').optional(),
        description: joi.instance.string().max(2000).allow('').optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const { name, code, instructor, description } = req.body

    // Reject a duplicate course code among the creator's own courses (case-insensitive).
    // Scoped to the owner so two different faculty can still reuse a code, and legacy/other
    // courses don't false-positive. The student join code is unique regardless.
    const dupe = Course.findOwnedFor(req.auth?.uid || '').some(
      (c) => (c.code || '').toUpperCase() === String(code).trim().toUpperCase(),
    )
    if (dupe) {
      return next({ statusCode: 409, message: 'You already have a course with that code.' })
    }

    const created = Course.create({
      name: String(name).trim(),
      code: String(code).trim(),
      instructor: String(instructor || '').trim(),
      description: String(description || '').trim(),
      ownerAccountId: req.auth?.uid,
    })
    res.status(201).json({ message: 'Course created', data: created })
  } catch (error) {
    next(error)
  }
}

export default createCourse
