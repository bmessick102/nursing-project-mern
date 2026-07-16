import express from 'express'
import checkBearerToken from '../middlewares/check-bearer-token'
import checkInstructorOrAdmin from '../middlewares/check-instructor-or-admin'
import errorHandler from '../middlewares/error-handler'
import createPeerReview from '../controllers/peerReviews/createPeerReview'
import listPeerReviews from '../controllers/peerReviews/listPeerReviews'
import listMyPeerReviews from '../controllers/peerReviews/listMyPeerReviews'
import getPeerReviewChart from '../controllers/peerReviews/getPeerReviewChart'
import submitPeerAssessment from '../controllers/peerReviews/submitPeerAssessment'

const router = express.Router()
const instructorGuard = [checkBearerToken, checkInstructorOrAdmin]

// Faculty: assign a reviewer to a reviewee's case-study instance, and list
// reviews for a template.
router.post('/', instructorGuard, createPeerReview, errorHandler)
router.get('/', instructorGuard, listPeerReviews, errorHandler)

// Student reviewer (bearer only): list own assignments (anonymized), read the
// assigned chart (anonymized), and submit per-note assessments.
router.get('/mine', [checkBearerToken], listMyPeerReviews, errorHandler)
router.get('/:id/chart', [checkBearerToken], getPeerReviewChart, errorHandler)
router.post('/:id/notes/:noteId/assessment', [checkBearerToken], submitPeerAssessment, errorHandler)

export default router
