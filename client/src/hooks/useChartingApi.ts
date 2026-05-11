import { useState, useCallback } from 'react'
import axios from 'utils/axios'
import type { Course, Patient, VitalSigns, NursingNote, IOEntry } from '@types'

export const useChartingApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/courses')
      return data.data as Course[]
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPatientsByCourse = useCallback(async (courseId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(`/patients/course/${courseId}`)
      return data.data as Patient[]
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const fetchPatient = useCallback(async (patientId: string) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get(`/patients/${patientId}`)
      return data.data as Patient
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addVitals = useCallback(async (patientId: string, vitals: Omit<VitalSigns, '_id'>) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.patch(`/patients/${patientId}/vitals`, vitals)
      return data.data as Patient
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addNote = useCallback(async (patientId: string, note: Omit<NursingNote, '_id'>) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.patch(`/patients/${patientId}/notes`, note)
      return data.data as Patient
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const signMAR = useCallback(
    async (patientId: string, payload: { entryId: string; scheduledTime: string; givenBy: string }) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/mar`, payload)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        setError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addIO = useCallback(async (patientId: string, io: Omit<IOEntry, '_id'>) => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.patch(`/patients/${patientId}/io`, io)
      return data.data as Patient
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      setError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  return {
    loading,
    error,
    fetchCourses,
    fetchPatientsByCourse,
    fetchPatient,
    addVitals,
    addNote,
    signMAR,
    addIO,
  }
}
