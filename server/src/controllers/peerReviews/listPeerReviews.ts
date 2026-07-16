import { type RequestHandler } from 'express'
import joi from '../../utils/joi'
import PeerReview from '../../models/FileBasedPeerReview'
import Account from '../../models/FileBasedAccount'

// Resolve an account's display name without ever leaking the password hash.
const resolveName = (accountId: string): string => {
  const acc = Account.findById(accountId)
  if (!acc) return 'Unknown'
  return [acc.firstName, acc.lastName].filter(Boolean).join(' ').trim() || acc.username
}

// Faculty view: all peer reviews for a given case-study template, with names resolved.
const listPeerReviews: RequestHandler = async (req, res, next) => {
  try {
    const validationError = await joi.validate(
      {
        templateId: joi.instance.string().required(),
      },
      req.query,
    )
    if (validationError) return next(validationError)

    const templateId = req.query.templateId as string

    const reviews = PeerReview.findByTemplate(templateId).map((r) => ({
      ...r,
      reviewerName: resolveName(r.reviewerAccountId),
      revieweeName: resolveName(r.revieweeAccountId),
    }))

    res.status(200).json({
      message: 'Peer reviews retrieved',
      data: { templateId, reviews },
    })
  } catch (error) {
    next(error)
  }
}

export default listPeerReviews
