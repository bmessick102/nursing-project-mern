import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import PeerReview from '../../models/FileBasedPeerReview'
import Patient from '../../models/FileBasedPatient'
import Account from '../../models/FileBasedAccount'
import Course from '../../models/FileBasedCourse'

// Resolve an account's display name without ever leaking the password hash.
const resolveName = (accountId: string): string => {
  const acc = Account.findById(accountId)
  if (!acc) return 'Unknown'
  return [acc.firstName, acc.lastName].filter(Boolean).join(' ').trim() || acc.username
}

// Faculty assigns a reviewer (a peer student) to review a reviewee's case-study instance.
const createPeerReview: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        reviewerAccountId: joi.instance.string().required(),
        revieweeInstanceId: joi.instance.string().required(),
      },
      req.body,
    )
    if (validationError) return next(validationError)

    const { reviewerAccountId, revieweeInstanceId } = req.body as {
      reviewerAccountId: string
      revieweeInstanceId: string
    }

    const instance = Patient.findById(revieweeInstanceId)
    if (!instance || !instance.ownerAccountId || !instance.templateId) {
      return next({ statusCode: 400, message: 'Not a student case-study instance' })
    }

    const courseId = instance.courseId
    const templateId = instance.templateId
    const revieweeAccountId = instance.ownerAccountId

    if (reviewerAccountId === revieweeAccountId) {
      return next({ statusCode: 400, message: 'A student cannot review their own chart' })
    }

    const reviewer = Account.findById(reviewerAccountId)
    if (!reviewer) return next({ statusCode: 400, message: 'Reviewer account not found' })

    const course = Course.findById(courseId)
    if (!course?.enrolledAccountIds?.includes(reviewerAccountId)) {
      return next({ statusCode: 400, message: 'Reviewer not enrolled' })
    }

    if (PeerReview.findExisting(reviewerAccountId, revieweeInstanceId)) {
      return next({ statusCode: 409, message: 'Already assigned' })
    }

    const createdBy = resolveName(req.auth!.uid)

    const review = PeerReview.create({
      courseId,
      templateId,
      reviewerAccountId,
      revieweeInstanceId,
      revieweeAccountId,
      status: 'assigned',
      createdBy,
    })

    res.status(201).json({ message: 'Peer review assigned', data: review })
  } catch (error) {
    next(error)
  }
}

export default createPeerReview
