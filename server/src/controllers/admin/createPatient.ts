import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import Patient from '../../models/FileBasedPatient'
import Course from '../../models/FileBasedCourse'

const createPatient: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        courseId: joi.instance.string().required(),
        name: joi.instance.string().min(1).max(120).required(),
        age: joi.instance.number().integer().min(0).max(130).optional(),
        gender: joi.instance.string().max(40).allow('').optional(),
        roomNumber: joi.instance.string().max(40).allow('').optional(),
        diagnosis: joi.instance.array().items(joi.instance.string().max(200)).optional(),
        allergies: joi.instance.array().items(joi.instance.string().max(200)).optional(),
        medications: joi.instance.array().items(joi.instance.object()).optional(),
        isCaseStudy: joi.instance.boolean().optional(),
        availableFrom: joi.instance.string().isoDate().allow('').optional(),
        availableUntil: joi.instance.string().isoDate().allow('').optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const {
      courseId,
      name,
      age,
      gender,
      roomNumber,
      diagnosis,
      allergies,
      medications,
      isCaseStudy,
      availableFrom,
      availableUntil,
    } = req.body || {}

    if (!Course.findById(courseId)) {
      return next({ statusCode: 400, message: 'courseId does not match any existing course' })
    }

    if (
      availableFrom &&
      availableUntil &&
      new Date(availableUntil).getTime() < new Date(availableFrom).getTime()
    ) {
      return next({ statusCode: 400, message: 'availableUntil must be on or after availableFrom' })
    }

    const created = Patient.create({
      courseId,
      name: String(name).trim(),
      age: Number(age) || 0,
      gender: String(gender || '').trim(),
      roomNumber: String(roomNumber || '').trim(),
      diagnosis: Array.isArray(diagnosis) ? diagnosis : [],
      allergies: Array.isArray(allergies) ? allergies : [],
      medications: Array.isArray(medications) ? medications : [],
      isCaseStudy: isCaseStudy ?? true,
      availableFrom: availableFrom || undefined,
      availableUntil: availableUntil || undefined,
      vitals: [],
      labs: [],
      encounters: [],
      nursingNotes: [],
      marEntries: [],
      ioEntries: [],
      orders: [],
      assessments: [],
      bradenScores: [],
    })

    res.status(201).json({ message: 'Patient created', data: created })
  } catch (error) {
    next(error)
  }
}

export default createPatient
