import { type RequestHandler } from 'express'
import PeerReview from '../../models/FileBasedPeerReview'
import Patient from '../../models/FileBasedPatient'

// Student reviewer: read the assigned chart ANONYMIZED. Ownership is enforced
// (only the assigned reviewer may read), and every field that could reveal the
// reviewee's identity or the instructor's private data is stripped.
const getPeerReviewChart: RequestHandler = async (req, res, next) => {
  try {
    const pr = PeerReview.findById(req.params.id as string)
    if (!pr) return next({ statusCode: 404, message: 'Peer review not found' })

    if (pr.reviewerAccountId !== req.auth!.uid) {
      return next({ statusCode: 403, message: 'Not your peer review assignment' })
    }

    const instance = Patient.findById(pr.revieweeInstanceId)
    if (!instance) return next({ statusCode: 404, message: 'Chart not found' })

    // Drop identity/instructor-only fields; keep the clinical record intact.
    const {
      ownerAccountId: _ownerAccountId,
      templateId: _templateId,
      dateShiftMs: _dateShiftMs,
      grade: _grade,
      instructorNotes: _instructorNotes,
      nursingNotes,
      ...rest
    } = instance

    const anonymized = {
      ...rest,
      nursingNotes: (nursingNotes || []).map((note) => ({
        ...note,
        author: 'Student',
      })),
    }

    res.status(200).json({
      message: 'Peer review chart retrieved',
      data: { peerReviewId: pr._id, status: pr.status, patient: anonymized },
    })
  } catch (error) {
    next(error)
  }
}

export default getPeerReviewChart
