import { type RequestHandler } from 'express'
import PeerReview from '../../models/FileBasedPeerReview'

// Student view: peer reviews assigned to me. ANONYMIZED — the reviewee's
// identity (name/id/account) is never disclosed to the reviewer.
const listMyPeerReviews: RequestHandler = async (req, res, next) => {
  try {
    const reviews = PeerReview.findByReviewer(req.auth!.uid).map((r) => ({
      _id: r._id,
      status: r.status,
      createdAt: r.createdAt,
    }))

    res.status(200).json({ message: 'Peer reviews retrieved', data: reviews })
  } catch (error) {
    next(error)
  }
}

export default listMyPeerReviews
