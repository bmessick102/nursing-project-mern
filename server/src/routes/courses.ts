import express, { type RequestHandler } from 'express'
import rateLimit from 'express-rate-limit'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkInstructorOrAdmin from '../middlewares/check-instructor-or-admin'
import errorHandler from '../middlewares/error-handler'
import Course from '../models/FileBasedCourse'
import Account from '../models/FileBasedAccount'
import { isAdminRole } from '../utils/authz'
import joinCourse from '../controllers/courses/joinCourse'

const router = express.Router()

// Throttle invite-code submissions so an attacker can't brute-force codes to
// self-enroll into arbitrary courses. Scoped to the join route only.
const joinLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many join attempts. Try again later.' },
})

// GET all courses — admin-grade endpoint kept for the admin dashboard's course list.
// Students should use /courses/mine instead, which is enrollment-scoped.
const getAllCourses: RequestHandler = (req, res, next) => {
  try {
    const role = (req as any).auth?.role as string | undefined
    const admin = isAdminRole(req as any)
    const list = admin ? Course.findAll() : Course.findOwnedFor((req as any).auth?.uid || '')
    const courses = list.map((c) => {
      const serialized = Course.serializeCourse(c, role)
      // Surface the true publisher (creating account) to admins only — the free-typed
      // `instructor` field can be blank/misspelled and isn't necessarily the account
      // that registered the course.
      if (!admin) return serialized
      const owner = c.ownerAccountId ? Account.findById(c.ownerAccountId) : undefined
      const publisherName = owner
        ? [owner.firstName, owner.lastName].filter(Boolean).join(' ').trim() || owner.username
        : undefined
      return { ...serialized, publisherName, publisherUsername: owner?.username }
    })
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
    // Hide archived courses from the student-facing enrolled list either way.
    const courses = (
      role === 'administrator' || role === 'admin'
        ? Course.findAll()
        : Course.findEnrolledFor(accountId)
    ).filter((c) => !c.archived)

    res.status(200).json({
      message: 'Successfully retrieved enrolled courses',
      data: courses.map((c) => Course.serializeCourse(c, role)),
    })
  } catch (error) {
    next(error)
  }
}

// GET course by ID
const getCourseById: RequestHandler = (req, res, next) => {
  try {
    const id = req.params.id as string
    const accountId = (req as any).auth?.uid as string | undefined
    const role = (req as any).auth?.role as string | undefined
    const isAdmin = role === 'administrator' || role === 'admin'

    const course = Course.findById(id)
    if (!course) {
      return next({
        statusCode: 404,
        message: 'Course not found',
      })
    }

    // Non-admins may only read a course they're enrolled in.
    if (!isAdmin && !(accountId && course.enrolledAccountIds.includes(accountId))) {
      return next({
        statusCode: 403,
        message: 'You are not enrolled in this course.',
      })
    }

    res.status(200).json({
      message: 'Successfully retrieved course',
      data: Course.serializeCourse(course, role),
    })
  } catch (error) {
    next(error)
  }
}

router.get('/', [checkBearerToken, checkInstructorOrAdmin], getAllCourses, errorHandler)
router.get('/mine', [checkBearerToken], getMyCourses, errorHandler)
router.post('/join', [checkBearerToken, joinLimiter], joinCourse, errorHandler)
router.get('/:id', [checkBearerToken], getCourseById, errorHandler)

export default router
