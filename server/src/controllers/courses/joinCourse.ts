import { type RequestHandler } from 'express'
import Course from '../../models/FileBasedCourse'
import Account from '../../models/FileBasedAccount'

const joinCourse: RequestHandler = (req, res, next) => {
  try {
    const accountId = (req as any).auth?.uid as string | undefined
    if (!accountId) return next({ statusCode: 401, message: 'Not authenticated' })
    const role = (req as any).auth?.role as string | undefined

    const code = String(req.body?.code || '').trim()
    if (!code) return next({ statusCode: 400, message: 'Course code is required' })

    const course = Course.findByInviteCode(code)
    if (!course) {
      return next({
        statusCode: 400,
        message: 'Invalid course code. Double-check the code your instructor gave you.',
      })
    }

    // Archived courses are hidden from students and no longer accept new enrollments.
    if (course.archived) {
      return next({ statusCode: 400, message: 'This course is no longer accepting enrollments.' })
    }

    // Atomically enroll on both sides (course + account).
    Course.addEnrollment(course._id, accountId)
    const updatedAccount = Account.addEnrolledCourse(accountId, course._id)

    // Return both so the client can update its store + display the newly-joined course.
    const joinedCourse = Course.findById(course._id)
    res.status(200).json({
      message: `Joined ${course.name}`,
      data: {
        course: joinedCourse ? Course.serializeCourse(joinedCourse, role) : null,
        account: updatedAccount
          ? (() => {
              const { password: _omit, ...safe } = updatedAccount as any
              return safe
            })()
          : null,
      },
    })
  } catch (error) {
    next(error)
  }
}

export default joinCourse
