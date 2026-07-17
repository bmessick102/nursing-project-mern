import React from 'react'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import { Box, CircularProgress } from '@mui/material'

const RequireStaff: React.FC = () => {
  const { account, isLoggedIn, initializing } = useAuth()

  if (initializing) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}><CircularProgress /></Box>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" replace />
  }

  const isStaff = account?.role === 'administrator' || account?.role === 'admin' || account?.role === 'instructor'
  if (!isStaff) {
    return <Navigate to="/course-select" replace />
  }

  return <Outlet />
}

export default RequireStaff
