import { useAuth } from 'contexts/AuthContext'
import type { AccountRole } from '@types'

const ROLE_LABEL: Record<AccountRole, string> = {
  student: 'Student',
  instructor: 'Instructor',
  administrator: 'Administrator',
  admin: 'Administrator',
  user: 'User',
}

export const useCurrentUser = () => {
  const { account } = useAuth()
  const username = account?.username || 'Unknown User'
  const role: AccountRole = account?.role || 'user'
  const firstName = account?.firstName || ''
  const lastName = account?.lastName || ''
  const fullName = [firstName, lastName].filter(Boolean).join(' ').trim()
  const displayName = fullName || username
  const roleLabel = ROLE_LABEL[role] || role
  return { username, role, roleLabel, firstName, lastName, fullName, displayName }
}
