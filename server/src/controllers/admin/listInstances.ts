import { type RequestHandler } from 'express'
import Patient from '../../models/FileBasedPatient'
import Account from '../../models/FileBasedAccount'
import { canManageCourseId } from '../../utils/authz'

// Admin-only: list the per-student instances spawned from a case-study template,
// each joined with the owning student's display name. Returns lightweight summaries
// only — never the full account record (which includes the password hash).
const listInstances: RequestHandler = async (req, res, next) => {
  try {
    const templateId = req.params.templateId as string
    const template = Patient.findById(templateId)
    if (!template || !template.isCaseStudy) {
      return next({ statusCode: 404, message: 'Case study not found' })
    }

    if (!canManageCourseId(req, template.courseId)) {
      return next({ statusCode: 403, message: 'You can only manage patients in your own courses.' })
    }

    const instances = Patient.findByTemplate(templateId).map((instance) => {
      const acct = instance.ownerAccountId ? Account.findById(instance.ownerAccountId) : undefined
      const studentName =
        [acct?.firstName, acct?.lastName].filter(Boolean).join(' ').trim() ||
        acct?.username ||
        'Unknown'
      return {
        _id: instance._id,
        ownerAccountId: instance.ownerAccountId,
        studentName,
        noteCount: (instance.nursingNotes || []).length,
        updatedAt: instance.updatedAt,
        grade: instance.grade,
      }
    })

    res.status(200).json({
      message: 'Successfully retrieved instances',
      data: {
        templateId,
        templateName: template.name,
        courseId: template.courseId,
        instances,
      },
    })
  } catch (error) {
    next(error)
  }
}

export default listInstances
