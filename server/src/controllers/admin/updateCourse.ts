import { type RequestHandler } from 'express'
import Course from '../../models/FileBasedCourse'

const ALLOWED = ['name', 'code', 'instructor', 'description'] as const

const updateCourse: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const patch: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (key in (req.body || {})) patch[key] = req.body[key]
    }
    const updated = Course.update(id, patch as any)
    if (!updated) return next({ statusCode: 404, message: 'Course not found' })
    res.status(200).json({ message: 'Course updated', data: updated })
  } catch (error) {
    next(error)
  }
}

export default updateCourse
