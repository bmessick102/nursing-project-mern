import { useState, useCallback } from 'react'
import axios from 'utils/axios'
import { useSnackbar } from 'contexts/SnackbarContext'
import type {
  Course,
  Patient,
  VitalSigns,
  NursingNote,
  IOEntry,
  NursingAssessment,
  BradenScore,
  Encounter,
  LabResult,
  MAREntry,
  Order,
} from '@types'

export const useChartingApi = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { notifyError } = useSnackbar()

  const reportError = useCallback(
    (msg: string) => {
      setError(msg)
      notifyError(msg || 'Request failed')
    },
    [notifyError],
  )

  const fetchCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/courses')
      return data.data as Course[]
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      reportError(errorMsg)
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
      reportError(errorMsg)
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
      reportError(errorMsg)
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
      reportError(errorMsg)
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
      reportError(errorMsg)
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
        reportError(errorMsg)
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
      reportError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [])

  const addAssessment = useCallback(
    async (patientId: string, assessment: Omit<NursingAssessment, '_id'>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/assessments`, assessment)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addBradenScore = useCallback(
    async (patientId: string, score: Omit<BradenScore, '_id'>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/braden`, score)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addEncounter = useCallback(
    async (patientId: string, encounter: Omit<Encounter, '_id'>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/encounters`, encounter)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addLab = useCallback(
    async (patientId: string, lab: Omit<LabResult, '_id'>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/labs`, lab)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addMAREntry = useCallback(
    async (
      patientId: string,
      entry: Omit<MAREntry, '_id' | 'administrations'> & {
        administrations?: MAREntry['administrations']
      },
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/mar-entries`, entry)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addOrder = useCallback(
    async (patientId: string, order: Omit<Order, '_id'>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/orders`, order)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const updatePatientFields = useCallback(
    async (
      patientId: string,
      patch: Partial<
        Pick<
          Patient,
          | 'allergies'
          | 'diagnosis'
          | 'medications'
          | 'roomNumber'
          | 'age'
          | 'gender'
          | 'name'
          | 'dischargeSummary'
        >
      >,
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/demographics`, patch)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  // --- Generic audit / edit / addendum / mark-in-error ---
  // :array ∈ encounters | labs | vitals | io | notes | mar-entries | assessments | braden | orders

  const editResource = useCallback(
    async (
      patientId: string,
      arrayKey: string,
      entryId: string,
      patch: Record<string, unknown>,
      reason?: string,
      modifiedBy?: string,
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.put(
          `/patients/${patientId}/resources/${arrayKey}/${entryId}`,
          { patch, reason, modifiedBy: modifiedBy || 'Current User' },
        )
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const addAddendumToResource = useCallback(
    async (
      patientId: string,
      arrayKey: string,
      entryId: string,
      content: string,
      author?: string,
      authorRole?: string,
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post(
          `/patients/${patientId}/resources/${arrayKey}/${entryId}/addendum`,
          { content, author: author || 'Current User', authorRole },
        )
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

  const markResourceInError = useCallback(
    async (
      patientId: string,
      arrayKey: string,
      entryId: string,
      reason: string,
      markedBy?: string,
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post(
          `/patients/${patientId}/resources/${arrayKey}/${entryId}/mark-in-error`,
          { reason, markedBy: markedBy || 'Current User' },
        )
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [],
  )

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
    addAssessment,
    addBradenScore,
    addEncounter,
    addLab,
    addMAREntry,
    editResource,
    addAddendumToResource,
    markResourceInError,
    addOrder,
    updatePatientFields,
  }
}
