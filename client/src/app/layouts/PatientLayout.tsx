import React, { useEffect, useState } from 'react'
import { useParams, Outlet, Navigate } from 'react-router-dom'
import { Box, CircularProgress, Alert } from '@mui/material'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'

type Status = 'loading' | 'ready' | 'error' | 'forbidden'

const PatientLayout: React.FC = () => {
  const { patientId } = useParams<{ patientId: string }>()
  const { selectedPatient, setSelectedPatient, selectedCourse } = useAppStore()
  const { fetchPatient } = useChartingApi()
  const [status, setStatus] = useState<Status>(
    selectedPatient?._id === patientId ? 'ready' : 'loading'
  )
  const [errorMsg, setErrorMsg] = useState('')

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!patientId) {
      setStatus('error')
      setErrorMsg('No patient ID in URL')
      return
    }

    if (selectedPatient?._id === patientId) {
      setStatus('ready')
      return
    }

    let cancelled = false
    setStatus('loading')

    fetchPatient(patientId)
      .then((patient) => {
        if (cancelled) return
        if (selectedCourse && patient.courseId !== selectedCourse._id) {
          setStatus('forbidden')
          return
        }
        setSelectedPatient(patient)
        setStatus('ready')
      })
      .catch((err) => {
        if (cancelled) return
        setStatus('error')
        setErrorMsg(err?.response?.data?.message || 'Failed to load patient')
      })

    return () => {
      cancelled = true
    }
    // Intentionally keyed on patientId only — including selectedPatient/fetchPatient
    // would refetch on every store mutation and loop. See project notes.
  }, [patientId]) // eslint-disable-line react-hooks/exhaustive-deps

  if (status === 'loading') {
    return <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}><CircularProgress /></Box>
  }

  if (status === 'forbidden') {
    return <Navigate to="/patients" replace />
  }

  if (status === 'error') {
    return <Alert severity="error" sx={{ m: 3 }}>{errorMsg}</Alert>
  }

  return <Outlet />
}

export default PatientLayout
