import { useAuth } from 'contexts/AuthContext'

export const useCurrentUser = () => {
  const { account } = useAuth()
  const username = account?.username || 'Unknown User'
  const role = account?.role || 'user'
  const displayName = username
  return { username, role, displayName }
}
