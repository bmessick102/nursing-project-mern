import fileDb from '../utils/fileDb'

const COLLECTION = 'peerReviews'

export interface PeerReview {
  _id: string
  courseId: string
  templateId: string
  reviewerAccountId: string
  revieweeInstanceId: string
  revieweeAccountId: string
  status: 'assigned' | 'submitted'
  createdBy: string
  createdAt: string
  updatedAt: string
}

const readAll = (): PeerReview[] => fileDb.readCollection(COLLECTION) as PeerReview[]

const findAll = (): PeerReview[] => readAll()

const findById = (id: string): PeerReview | undefined => {
  return readAll().find((r) => r._id === id)
}

const findByTemplate = (templateId: string): PeerReview[] => {
  return readAll().filter((r) => r.templateId === templateId)
}

const findByReviewer = (reviewerAccountId: string): PeerReview[] => {
  return readAll().filter((r) => r.reviewerAccountId === reviewerAccountId)
}

// Prevent duplicate assignments of the same reviewer to the same reviewee instance.
const findExisting = (
  reviewerAccountId: string,
  revieweeInstanceId: string,
): PeerReview | undefined => {
  return readAll().find(
    (r) =>
      r.reviewerAccountId === reviewerAccountId &&
      r.revieweeInstanceId === revieweeInstanceId,
  )
}

const create = (
  data: Omit<PeerReview, '_id' | 'createdAt' | 'updatedAt'>,
): PeerReview => {
  const reviews = readAll()
  const now = new Date().toISOString()
  const newReview: PeerReview = {
    ...data,
    _id: fileDb.generateId(),
    createdAt: now,
    updatedAt: now,
  }
  reviews.push(newReview)
  fileDb.writeCollection(COLLECTION, reviews)
  return newReview
}

const update = (id: string, patch: Partial<PeerReview>): PeerReview | undefined => {
  const reviews = readAll()
  const idx = reviews.findIndex((r) => r._id === id)
  if (idx === -1) return undefined
  reviews[idx] = {
    ...reviews[idx],
    ...patch,
    _id: reviews[idx]._id,
    createdAt: reviews[idx].createdAt,
    updatedAt: new Date().toISOString(),
  }
  fileDb.writeCollection(COLLECTION, reviews)
  return reviews[idx]
}

export default {
  findAll,
  findById,
  findByTemplate,
  findByReviewer,
  findExisting,
  create,
  update,
}
