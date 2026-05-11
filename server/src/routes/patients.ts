import express, { type RequestHandler } from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import Patient from '../models/FileBasedPatient'
import fileDb from '../utils/fileDb'

const router = express.Router()

// GET all patients
const getAllPatients: RequestHandler = (req, res, next) => {
  try {
    const patients = Patient.findAll()
    res.status(200).json({
      message: 'Successfully retrieved patients',
      data: patients,
    })
  } catch (error) {
    next(error)
  }
}

// GET patients by course
const getPatientsByCourse: RequestHandler = (req, res, next) => {
  try {
    const courseId = req.params.courseId as string
    const patients = Patient.findByCourse(courseId)
    res.status(200).json({
      message: 'Successfully retrieved patients',
      data: patients,
    })
  } catch (error) {
    next(error)
  }
}

// GET patient by ID
const getPatientById: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    res.status(200).json({
      message: 'Successfully retrieved patient',
      data: patient,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add vitals entry
const addVitals: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const vitals = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const vitalWithId = {
      ...vitals,
      _id: fileDb.generateId(),
    }
    patient.vitals.push(vitalWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Vitals entry added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add nursing note
const addNote: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const note = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const noteWithId = {
      ...note,
      _id: fileDb.generateId(),
    }
    patient.nursingNotes.push(noteWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'Nursing note added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Mark MAR as given
const signMAR: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const { entryId, scheduledTime, givenBy } = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const marEntry = patient.marEntries.find((m) => m._id === entryId)
    if (!marEntry) {
      return next({
        statusCode: 404,
        message: 'MAR entry not found',
      })
    }
    const adminIdx = marEntry.administrations.findIndex((a) => a.scheduledTime === scheduledTime)
    if (adminIdx === -1) {
      return next({
        statusCode: 404,
        message: 'Scheduled time not found',
      })
    }
    marEntry.administrations[adminIdx] = {
      ...marEntry.administrations[adminIdx],
      status: 'given',
      givenAt: new Date().toISOString().substring(11, 16),
      givenBy,
    }
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'MAR entry marked as given',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

// PATCH - Add I/O entry
const addIO: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const io = req.body
    const patient = Patient.findById(id)
    if (!patient) {
      return next({
        statusCode: 404,
        message: 'Patient not found',
      })
    }
    const ioWithId = {
      ...io,
      _id: fileDb.generateId(),
    }
    patient.ioEntries.push(ioWithId)
    const updated = Patient.update(id, patient)
    res.status(200).json({
      message: 'I/O entry added successfully',
      data: updated,
    })
  } catch (error) {
    next(error)
  }
}

router.get('/', [checkBearerToken], getAllPatients, errorHandler)
router.get('/course/:courseId', [checkBearerToken], getPatientsByCourse, errorHandler)
router.get('/:id', [checkBearerToken], getPatientById, errorHandler)
router.patch('/:id/vitals', [checkBearerToken], addVitals, errorHandler)
router.patch('/:id/notes', [checkBearerToken], addNote, errorHandler)
router.patch('/:id/mar', [checkBearerToken], signMAR, errorHandler)
router.patch('/:id/io', [checkBearerToken], addIO, errorHandler)

export default router
