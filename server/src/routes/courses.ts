import express, { type RequestHandler } from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import Course from '../models/FileBasedCourse'
import joinCourse from '../controllers/courses/joinCourse'

const router = express.Router()

// GET all courses — admin-grade endpoint kept for the admin dashboard's course list.
// Students should use /courses/mine instead, which is enrollment-scoped.
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

// GET only the courses the requesting account is enrolled in.
const getMyCourses: RequestHandler = (req, res, next) => {
  try {
    const accountId = (req as any).auth?.uid as string | undefined
    if (!accountId) return next({ statusCode: 401, message: 'Not authenticated' })
    const role = (req as any).auth?.role as string | undefined

    // Administrators see every course; students see only enrolled.
    const courses =
      role === 'administrator' || role === 'admin'
        ? Course.findAll()
        : Course.findEnrolledFor(accountId)

    res.status(200).json({
      message: 'Successfully retrieved enrolled courses',
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
router.get('/mine', [checkBearerToken], getMyCourses, errorHandler)
router.post('/join', [checkBearerToken], joinCourse, errorHandler)
router.get('/:id', [checkBearerToken], getCourseById, errorHandler)

export default router
