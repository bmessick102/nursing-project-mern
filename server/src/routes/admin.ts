import express from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkAdmin from '../middlewares/check-admin'
import checkInstructorOrAdmin from '../middlewares/check-instructor-or-admin'
import errorHandler from '../middlewares/error-handler'
import createCourse from '../controllers/admin/createCourse'
import updateCourse from '../controllers/admin/updateCourse'
import regenerateCourseCode from '../controllers/admin/regenerateCourseCode'
import listAccounts from '../controllers/admin/listAccounts'
import createAccount from '../controllers/admin/createAccount'
import updateAccount from '../controllers/admin/updateAccount'
import createPatient from '../controllers/admin/createPatient'
import updatePatient from '../controllers/admin/updatePatient'
import listInstances from '../controllers/admin/listInstances'
import addNoteComment from '../controllers/admin/addNoteComment'
import gradeInstance from '../controllers/admin/gradeInstance'

const router = express.Router()
const adminGuard = [checkBearerToken, checkAdmin]
const instructorGuard = [checkBearerToken, checkInstructorOrAdmin]

// Courses
router.post('/courses', instructorGuard, createCourse, errorHandler)
router.patch('/courses/:id', instructorGuard, updateCourse, errorHandler)
router.post('/courses/:id/regenerate-code', instructorGuard, regenerateCourseCode, errorHandler)

// Patients
router.post('/patients', instructorGuard, createPatient, errorHandler)
router.patch('/patients/:id', instructorGuard, updatePatient, errorHandler)
router.get('/patients/:templateId/instances', instructorGuard, listInstances, errorHandler)
router.post('/patients/:id/notes/:noteId/comments', instructorGuard, addNoteComment, errorHandler)
router.patch('/patients/:id/grade', [checkBearerToken, checkInstructorOrAdmin], gradeInstance, errorHandler)

// Accounts
router.get('/accounts', adminGuard, listAccounts, errorHandler)
router.post('/accounts', adminGuard, createAccount, errorHandler)
router.patch('/accounts/:id', adminGuard, updateAccount, errorHandler)

export default router
