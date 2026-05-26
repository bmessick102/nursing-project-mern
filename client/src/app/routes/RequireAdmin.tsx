import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import { Box, CircularProgress } from '@mui/material'

const RequireAdmin: React.FC = () => {
  const { account, isLoggedIn, initializing } = useAuth()

  if (initializing) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}><CircularProgress /></Box>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  const isAdmin = account?.role === 'administrator' || account?.role === 'admin'
  if (!isAdmin) {
    return <Navigate to="/course-select" replace />
  }

  return <Outlet />
}

export default RequireAdmin
