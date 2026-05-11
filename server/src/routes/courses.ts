import express, { type RequestHandler } from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import Course from '../models/FileBasedCourse'

const router = express.Router()

// GET all courses
const getAllCourses: RequestHandler = (req, res, next) => {
  try {
    const courses = Course.findAll()
    res.status(200).json({
      message: 'Successfully retrieved courses',
      data: courses,
    })
  } catch (error) {
    next(error)
  }
}

// GET course by ID
const getCourseById: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const course = Course.findById(id)
    if (!course) {
      return next({
        statusCode: 404,
        message: 'Course not found',
      })
    }
    res.status(200).json({
      message: 'Successfully retrieved course',
      data: course,
    })
  } catch (error) {
    next(error)
  }
}

router.get('/', [checkBearerToken], getAllCourses, errorHandler)
router.get('/:id', [checkBearerToken], getCourseById, errorHandler)

export default router
