import Course from '../models/FileBasedCourse'

// `req` is typed loosely (any) so these helpers accept an Express `Request` whose
// `req.auth` is the globally-augmented JwtPayload, matching how the rest of the
// codebase reads `(req as any).auth`.
const auth = (req: any): { uid?: string; role?: string } => (req?.auth ?? {}) as { uid?: string; role?: string }

export const isAdminRole = (req: any): boolean => {
  const r = auth(req).role
  return r === 'administrator' || r === 'admin'
}

export const isElevatedRole = (req: any): boolean =>
  isAdminRole(req) || auth(req).role === 'instructor'

// Admins can manage any course; a non-admin must be the course owner.
export const ownsCourse = (req: any, course?: { ownerAccountId?: string } | null): boolean => {
  if (isAdminRole(req)) return true
  const uid = auth(req).uid
  return !!uid && !!course && course.ownerAccountId === uid
}

export const canManageCourseId = (req: any, courseId?: string): boolean => {
  if (isAdminRole(req)) return true
  if (!courseId) return false
  return ownsCourse(req, Course.findById(courseId))
}
