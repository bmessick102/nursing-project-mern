import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import NoteTemplate from '../../models/FileBasedNoteTemplate'
import Course from '../../models/FileBasedCourse'
import Account from '../../models/FileBasedAccount'

const soapSchema = joi.instance.object({
  subjective: joi.instance.string().allow('').optional(),
  objective: joi.instance.string().allow('').optional(),
  assessment: joi.instance.string().allow('').optional(),
  plan: joi.instance.string().allow('').optional(),
})

const createNoteTemplate: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        name: joi.instance.string().min(1).max(120).required(),
        courseId: joi.instance.string().allow(null).optional(),
        format: joi.instance.string().valid('freetext', 'soap').optional(),
        content: joi.instance.string().allow('').optional(),
        soap: soapSchema.optional(),
        defaultRole: joi.instance.string().allow('').optional(),
        defaultType: joi.instance.string().allow('').optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const { name, courseId, format, content, soap, defaultRole, defaultType } = req.body

    // If a specific course is targeted, ensure it exists.
    if (courseId !== null && courseId !== undefined && String(courseId) !== '') {
      const course = Course.findById(String(courseId))
      if (!course) return next({ statusCode: 400, message: 'Course not found' })
    }

    // Resolve a human-readable author name for display/attribution.
    const account = Account.findById((req as any).auth?.uid as string)
    const createdBy =
      [account?.firstName, account?.lastName].filter(Boolean).join(' ').trim() ||
      account?.username ||
      ((req as any).auth?.uid as string)

    const created = NoteTemplate.create({
      name: String(name).trim(),
      courseId: courseId || null,
      format: (format as 'freetext' | 'soap') || 'freetext',
      content: content !== undefined ? String(content) : undefined,
      soap: soap || undefined,
      defaultRole: defaultRole !== undefined ? String(defaultRole) : undefined,
      defaultType: defaultType !== undefined ? String(defaultType) : undefined,
      createdBy,
    })

    res.status(201).json({ message: 'Template created', data: created })
  } catch (error) {
    next(error)
  }
}

export default createNoteTemplate
