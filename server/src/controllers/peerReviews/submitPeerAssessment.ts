import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import fileDb from '../../utils/fileDb'
import PeerReview from '../../models/FileBasedPeerReview'
import Patient from '../../models/FileBasedPatient'

// Student reviewer: submit (or update) a per-note peer assessment. Ownership is
// enforced; the assessment is upserted keyed by peerReviewId so re-submitting
// edits the existing entry rather than duplicating it.
const submitPeerAssessment: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        correct: joi.instance.boolean().required(),
        comment: joi.instance.string().allow('').max(5000).optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const { correct, comment } = req.body as { correct: boolean; comment?: string }

    const pr = PeerReview.findById(req.params.id as string)
    if (!pr) return next({ statusCode: 404, message: 'Peer review not found' })

    if (pr.reviewerAccountId !== req.auth!.uid) {
      return next({ statusCode: 403, message: 'Not your peer review assignment' })
    }

    const instance = Patient.findById(pr.revieweeInstanceId)
    if (!instance) return next({ statusCode: 404, message: 'Chart not found' })

    const noteIdx = instance.nursingNotes.findIndex((n) => n._id === req.params.noteId)
    if (noteIdx === -1) return next({ statusCode: 404, message: 'Note not found' })

    const note = instance.nursingNotes[noteIdx]
    const assessments = note.peerAssessments || []
    const existingIdx = assessments.findIndex((a) => a.peerReviewId === pr._id)

    if (existingIdx !== -1) {
      assessments[existingIdx] = {
        ...assessments[existingIdx],
        correct,
        comment: comment || '',
        createdAt: new Date().toISOString(),
      }
    } else {
      if (assessments.length >= 200) {
        return next({ statusCode: 400, message: 'Too many assessments on this note' })
      }
      assessments.push({
        _id: fileDb.generateId(),
        peerReviewId: pr._id,
        correct,
        comment: comment || '',
        createdAt: new Date().toISOString(),
      })
    }

    note.peerAssessments = assessments
    instance.nursingNotes[noteIdx] = note
    Patient.update(instance._id, instance)

    PeerReview.update(pr._id, { status: 'submitted' })

    res.status(200).json({ message: 'Assessment saved', data: { peerReviewId: pr._id } })
  } catch (error) {
    next(error)
  }
}

export default submitPeerAssessment
