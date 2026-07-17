import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import Patient from '../../models/FileBasedPatient'
import Account from '../../models/FileBasedAccount'
import { canManageCourseId } from '../../utils/authz'

// Faculty (instructor or admin) grade a student's case-study instance. The grader's
// identity is resolved server-side from the authenticated account so attribution
// can't be forged from the client.
const gradeInstance: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        score: joi.instance.number().min(0).required(),
        maxScore: joi.instance.number().min(1).required(),
        feedback: joi.instance.string().allow('').max(5000).optional(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const { score, maxScore, feedback } = req.body || {}
    if (score > maxScore) {
      return next({ statusCode: 400, message: 'score must be less than or equal to maxScore' })
    }

    const patient = Patient.findById(req.params.id as string)
    if (!patient) return next({ statusCode: 404, message: 'Patient not found' })

    if (!canManageCourseId(req, patient.courseId)) {
      return next({ statusCode: 403, message: 'You can only manage patients in your own courses.' })
    }

    // Resolve grader identity from the authenticated account.
    const acct = req.auth?.uid ? Account.findById(req.auth.uid) : undefined
    const gradedBy =
      [acct?.firstName, acct?.lastName].filter(Boolean).join(' ').trim() ||
      acct?.username ||
      'Instructor'

    patient.grade = {
      score,
      maxScore,
      feedback: feedback || '',
      gradedBy,
      gradedAt: new Date().toISOString(),
    }

    const updated = Patient.update(req.params.id as string, patient)
    res.status(200).json({ message: 'Grade saved', data: updated })
  } catch (error) {
    next(error)
  }
}

export default gradeInstance
