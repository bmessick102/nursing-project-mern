import { type RequestHandler } from 'express'
import Patient from '../../models/FileBasedPatient'
import Course from '../../models/FileBasedCourse'

const createPatient: RequestHandler = (req, res, next) => {
  try {
    const {
      courseId,
      name,
      age,
      gender,
      roomNumber,
      diagnosis,
      allergies,
      medications,
    } = req.body || {}

    if (!name || !courseId) {
      return next({ statusCode: 400, message: 'name and courseId are required' })
    }
    if (!Course.findById(courseId)) {
      return next({ statusCode: 400, message: 'courseId does not match any existing course' })
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
