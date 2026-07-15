import express from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkAdmin from '../middlewares/check-admin'
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

const router = express.Router()
const adminGuard = [checkBearerToken, checkAdmin]

// Courses
router.post('/courses', adminGuard, createCourse, errorHandler)
router.patch('/courses/:id', adminGuard, updateCourse, errorHandler)
router.post('/courses/:id/regenerate-code', adminGuard, regenerateCourseCode, errorHandler)

// Patients
router.post('/patients', adminGuard, createPatient, errorHandler)
router.patch('/patients/:id', adminGuard, updatePatient, errorHandler)
router.get('/patients/:templateId/instances', adminGuard, listInstances, errorHandler)
router.post('/patients/:id/notes/:noteId/comments', adminGuard, addNoteComment, errorHandler)

// Accounts
router.get('/accounts', adminGuard, listAccounts, errorHandler)
router.post('/accounts', adminGuard, createAccount, errorHandler)
router.patch('/accounts/:id', adminGuard, updateAccount, errorHandler)

export default router
