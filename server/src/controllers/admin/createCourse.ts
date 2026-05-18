import { type RequestHandler } from 'express'
import Course from '../../models/FileBasedCourse'

const createCourse: RequestHandler = (req, res, next) => {
  try {
    const { name, code, instructor, description } = req.body || {}
    if (!name || !code) {
      return next({ statusCode: 400, message: 'name and code are required' })
    }
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
