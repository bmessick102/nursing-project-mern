import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import Patient from '../../models/FileBasedPatient'
import { canManageCourseId } from '../../utils/authz'

const ALLOWED = [
  'isCaseStudy',
  'availableFrom',
  'availableUntil',
  'relativeDateOffsetDays',
  'name',
  'age',
  'gender',
  'roomNumber',
  'diagnosis',
  'allergies',
  'medications',
] as const

const updatePatient: RequestHandler = async (req, res, next) => {
  try {
    const id = req.params.id as string

    const validationError = await joi.validate(
      {
        isCaseStudy: joi.instance.boolean().optional(),
        availableFrom: joi.instance.string().isoDate().allow('').optional(),
        availableUntil: joi.instance.string().isoDate().allow('').optional(),
        relativeDateOffsetDays: joi.instance.number().integer().min(0).max(60).optional(),
        name: joi.instance.string().min(1).max(120).optional(),
        age: joi.instance.number().integer().min(0).max(130).optional(),
        gender: joi.instance.string().max(40).allow('').optional(),
        roomNumber: joi.instance.string().max(40).allow('').optional(),
        diagnosis: joi.instance.array().items(joi.instance.string().max(200)).optional(),
        allergies: joi.instance.array().items(joi.instance.string().max(200)).optional(),
        medications: joi.instance.array().items(joi.instance.object()).optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const existing = Patient.findById(id)
    if (!existing) return next({ statusCode: 404, message: 'Patient not found' })

    if (!canManageCourseId(req, existing.courseId)) {
      return next({ statusCode: 403, message: 'You can only manage patients in your own courses.' })
    }

    const patch: Record<string, unknown> = {}
    for (const key of ALLOWED) {
      if (key in (req.body || {})) patch[key] = req.body[key]
    }

    const availableFrom =
      'availableFrom' in patch ? (patch.availableFrom as string) : existing.availableFrom
    const availableUntil =
      'availableUntil' in patch ? (patch.availableUntil as string) : existing.availableUntil
    if (
      availableFrom &&
      availableUntil &&
      new Date(availableUntil).getTime() < new Date(availableFrom).getTime()
    ) {
      return next({ statusCode: 400, message: 'availableUntil must be on or after availableFrom' })
    }

    const updated = Patient.update(id, patch as any)
    res.status(200).json({ message: 'Patient updated', data: updated })
  } catch (error) {
    next(error)
  }
}

export default updatePatient
