import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import NoteTemplate, { type NoteTemplate as NoteTemplateType } from '../../models/FileBasedNoteTemplate'
import Course from '../../models/FileBasedCourse'

const soapSchema = joi.instance.object({
  subjective: joi.instance.string().allow('').optional(),
  objective: joi.instance.string().allow('').optional(),
  assessment: joi.instance.string().allow('').optional(),
  plan: joi.instance.string().allow('').optional(),
})

const ALLOWED = [
  'name',
  'courseId',
  'format',
  'content',
  'soap',
  'defaultRole',
  'defaultType',
] as const

const updateNoteTemplate: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string

    const existing = NoteTemplate.findById(id)
    if (!existing) return next({ statusCode: 404, message: 'Template not found' })

    const validationError = await joi.validate(
      {
        name: joi.instance.string().min(1).max(120).optional(),
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

    const patch: Partial<NoteTemplateType> = {}
    for (const key of ALLOWED) {
      if (key in (req.body || {})) (patch as Record<string, unknown>)[key] = req.body[key]
    }

    // Validate a targeted course when courseId is being set to a real value.
    if ('courseId' in patch) {
      const nextCourseId = patch.courseId
      if (nextCourseId !== null && nextCourseId !== undefined && String(nextCourseId) !== '') {
        const course = Course.findById(String(nextCourseId))
        if (!course) return next({ statusCode: 400, message: 'Course not found' })
      }
    }

    const updated = NoteTemplate.update(id, patch)
    res.status(200).json({ message: 'Template updated', data: updated })
  } catch (error) {
    next(error)
  }
}

export default updateNoteTemplate
