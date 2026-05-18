import { type RequestHandler } from 'express'
import Account from '../../models/FileBasedAccount'
import { type AccountRole } from '../../@types'

const ALLOWED_ROLES: AccountRole[] = ['student', 'instructor', 'administrator']

const updateAccount: RequestHandler = (req, res, next) => {
  try {
    const targetId = req.params.id as string
    const callerId = (req as any).auth?.uid as string | undefined
    const target = Account.findById(targetId)
    if (!target) return next({ statusCode: 404, message: 'Account not found' })

    const incoming = req.body || {}
    const patch: Record<string, unknown> = {}

    if ('firstName' in incoming) patch.firstName = String(incoming.firstName || '').trim()
    if ('lastName' in incoming) patch.lastName = String(incoming.lastName || '').trim()
    if ('email' in incoming) patch.email = String(incoming.email || '').trim()

    if ('role' in incoming) {
      const newRole = incoming.role as AccountRole
      if (!ALLOWED_ROLES.includes(newRole)) {
        return next({ statusCode: 400, message: 'Invalid role' })
      }
      // Last-admin guard: if target is currently an admin and we're demoting,
      // make sure another active admin exists.
      const wasAdmin = target.role === 'administrator' || target.role === 'admin'
      const willBeAdmin = newRole === 'administrator'
      if (wasAdmin && !willBeAdmin) {
        if (Account.countByRole('administrator') + Account.countByRole('admin') <= 1) {
          return next({
            statusCode: 409,
            message: 'Cannot demote the last administrator. Promote another account first.',
          })
        }
      }
      // Self-demotion lockout guard.
      if (targetId === callerId && !willBeAdmin) {
        return next({
          statusCode: 409,
          message: 'You cannot demote your own administrator account.',
        })
      }
      patch.role = newRole
    }

    if ('active' in incoming) {
      const willBeActive = !!incoming.active
      if (!willBeActive) {
        // Cannot deactivate self.
        if (targetId === callerId) {
          return next({
            statusCode: 409,
            message: 'You cannot deactivate your own account.',
          })
        }
        // Last-admin guard for deactivation as well.
        const wasAdmin = target.role === 'administrator' || target.role === 'admin'
        if (wasAdmin) {
          if (Account.countByRole('administrator') + Account.countByRole('admin') <= 1) {
            return next({
              statusCode: 409,
              message:
                'Cannot deactivate the last administrator. Promote another account first.',
            })
          }
        }
      }
      patch.active = willBeActive
    }

    const updated = Account.update(targetId, patch as any)
    if (!updated) return next({ statusCode: 404, message: 'Account not found after update' })
    const { password: _omit, ...safe } = updated as any
    res.status(200).json({ message: 'Account updated', data: safe })
  } catch (error) {
    next(error)
  }
}

export default updateAccount
