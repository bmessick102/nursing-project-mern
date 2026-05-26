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
    const created = Course.create({
      name: String(name).trim(),
      code: String(code).trim(),
      instructor: String(instructor || '').trim(),
      description: String(description || '').trim(),
    })
    res.status(201).json({ message: 'Course created', data: created })
  } catch (error) {
    next(error)
  }
}

export default createCourse
