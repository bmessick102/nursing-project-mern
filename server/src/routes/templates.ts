import express from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkInstructorOrAdmin from '../middlewares/check-instructor-or-admin'
import errorHandler from '../middlewares/error-handler'
import listNoteTemplates from '../controllers/noteTemplates/listNoteTemplates'
import createNoteTemplate from '../controllers/noteTemplates/createNoteTemplate'
import updateNoteTemplate from '../controllers/noteTemplates/updateNoteTemplate'
import deleteNoteTemplate from '../controllers/noteTemplates/deleteNoteTemplate'

const router = express.Router()
const instructorGuard = [checkBearerToken, checkInstructorOrAdmin]

// Any authenticated user may list templates (students consume them when charting).
router.get('/', [checkBearerToken], listNoteTemplates, errorHandler)

// Authoring is restricted to instructors/administrators.
router.post('/', instructorGuard, createNoteTemplate, errorHandler)
router.patch('/:id', instructorGuard, updateNoteTemplate, errorHandler)
router.delete('/:id', instructorGuard, deleteNoteTemplate, errorHandler)

export default router
