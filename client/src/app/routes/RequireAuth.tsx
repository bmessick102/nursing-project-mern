import React from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import { Box, CircularProgress } from '@mui/material'

interface Props {
  requireCourse?: boolean
}

const RequireAuth: React.FC<Props> = ({ requireCourse = true }) => {
  const { isLoggedIn, initializing } = useAuth()
  const { selectedCourse } = useAppStore()
  const location = useLocation()

  if (initializing) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 12 }}><CircularProgress /></Box>
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (requireCourse && !selectedCourse) {
    return <Navigate to="/course-select" replace />
  }

  return <Outlet />
}

export default RequireAuth
