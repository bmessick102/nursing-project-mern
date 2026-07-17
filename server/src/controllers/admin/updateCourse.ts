import { type RequestHandler } from 'express'
import Course from '../../models/FileBasedCourse'
import Account from '../../models/FileBasedAccount'
import { canManageCourseId, isAdminRole } from '../../utils/authz'

const ALLOWED = ['name', 'code', 'instructor', 'description', 'archived', 'ownerAccountId'] as const

const updateCourse: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    if (!canManageCourseId(req as any, id))
      return next({ statusCode: 403, message: 'You can only manage your own courses.' })

    // Reassigning ownership is admin-only.
    if ('ownerAccountId' in (req.body || {}) && !isAdminRole(req as any))
      return next({ statusCode: 403, message: 'Only administrators can reassign course ownership.' })

    // Validate the new owner is an existing faculty/admin account.
    if (typeof req.body?.ownerAccountId === 'string' && req.body.ownerAccountId.trim() !== '') {
      const owner = Account.findById(req.body.ownerAccountId)
      const allowedRoles = ['instructor', 'administrator', 'admin']
      if (!owner || !allowedRoles.includes(owner.role))
        return next({ statusCode: 400, message: 'Owner must be an existing faculty or admin account.' })
    }

    // Reject a duplicate course code among the owner's OTHER courses (case-insensitive),
    // excluding the course being edited — consistent with the create-course guard.
    if (typeof req.body?.code === 'string' && req.body.code.trim() !== '') {
      const course = Course.findById(id)
      const newCode = req.body.code.trim().toUpperCase()
      if (course && course.ownerAccountId && newCode !== (course.code || '').toUpperCase()) {
        const dupe = Course.findOwnedFor(course.ownerAccountId).some(
          (c) => c._id !== id && (c.code || '').toUpperCase() === newCode,
        )
        if (dupe)
          return next({ statusCode: 409, message: 'You already have a course with that code.' })
      }
    }

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
