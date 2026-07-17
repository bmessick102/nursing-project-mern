import { type RequestHandler } from 'express'
import Course from '../../models/FileBasedCourse'
import { canManageCourseId } from '../../utils/authz'

const regenerateCourseCode: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    if (!canManageCourseId(req as any, id))
      return next({ statusCode: 403, message: 'You can only manage your own courses.' })
    const updated = Course.regenerateCode(id)
    if (!updated) return next({ statusCode: 404, message: 'Course not found' })
    res.status(200).json({ message: 'Course invite code regenerated', data: updated })
  } catch (error) {
    next(error)
  }
}

export default regenerateCourseCode
