import { type RequestHandler } from 'express'
import NoteTemplate from '../../models/FileBasedNoteTemplate'
import { isAdminRole, canManageCourseId } from '../../utils/authz'

const deleteNoteTemplate: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string

    // Load first so we can enforce ownership before removing.
    const existing = NoteTemplate.findById(id)
    if (!existing) return next({ statusCode: 404, message: 'Template not found' })

    if (existing.courseId === null || existing.courseId === undefined || String(existing.courseId) === '') {
      // Global template: admins only.
      if (!isAdminRole(req)) {
        return next({ statusCode: 403, message: 'Only administrators can delete global templates.' })
      }
    } else if (!canManageCourseId(req, String(existing.courseId))) {
      return next({ statusCode: 403, message: 'You can only delete templates for your own courses.' })
    }

    const ok = NoteTemplate.remove(id)
    if (!ok) return next({ statusCode: 404, message: 'Template not found' })
    res.status(200).json({ message: 'Template deleted', data: { _id: id } })
  } catch (error) {
    next(error)
  }
}

export default deleteNoteTemplate
