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
  }, [reportError])

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
  }, [reportError])

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
  }, [reportError])

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
  }, [reportError])

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
  }, [reportError])

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
    [reportError],
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
  }, [reportError])

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
    [reportError],
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
    [reportError],
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
    [reportError],
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
    [reportError],
  )

  const addLabsBatch = useCallback(
    async (patientId: string, labs: Omit<LabResult, '_id'>[]) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/patients/${patientId}/labs/batch`, { labs })
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
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
    [reportError],
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
    [reportError],
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
    [reportError],
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
    [reportError],
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
    [reportError],
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
    [reportError],
  )

  // --- Course enrollment (student) ---

  const fetchMyCourses = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/courses/mine')
      return data.data as Course[]
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      reportError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [reportError])

  const joinCourse = useCallback(
    async (code: string) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post('/courses/join', { code })
        return data.data as { course: Course; account: Patient extends never ? never : any }
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  // --- Admin endpoints ---

  const adminCreateCourse = useCallback(
    async (payload: { name: string; code: string; instructor: string; description: string }) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post('/admin/courses', payload)
        return data.data as Course
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminUpdateCourse = useCallback(
    async (id: string, patch: Partial<Course>) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/admin/courses/${id}`, patch)
        return data.data as Course
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminRegenerateCourseCode = useCallback(
    async (id: string) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post(`/admin/courses/${id}/regenerate-code`)
        return data.data as Course
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminCreatePatient = useCallback(
    async (payload: {
      courseId: string
      name: string
      age: number
      gender: string
      roomNumber: string
      diagnosis: string[]
      allergies: string[]
      medications?: { name: string; dose: string; frequency: string }[]
    }) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post('/admin/patients', payload)
        return data.data as Patient
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminCreateAccount = useCallback(
    async (payload: {
      username: string
      password: string
      role: 'student' | 'instructor' | 'administrator'
      firstName?: string
      lastName?: string
      email?: string
    }) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.post('/admin/accounts', payload)
        return data.data
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminUpdateAccount = useCallback(
    async (
      id: string,
      patch: {
        role?: 'student' | 'instructor' | 'administrator'
        active?: boolean
        firstName?: string
        lastName?: string
        email?: string
      },
    ) => {
      setLoading(true)
      setError(null)
      try {
        const { data } = await axios.patch(`/admin/accounts/${id}`, patch)
        return data.data
      } catch (err: any) {
        const errorMsg = err?.response?.data?.message || err.message
        reportError(errorMsg)
        throw err
      } finally {
        setLoading(false)
      }
    },
    [reportError],
  )

  const adminListAccounts = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const { data } = await axios.get('/admin/accounts')
      return data.data as Array<{
        _id: string
        username: string
        role: string
        firstName?: string
        lastName?: string
        email?: string
        enrolledCourseIds?: string[]
        createdAt?: string
      }>
    } catch (err: any) {
      const errorMsg = err?.response?.data?.message || err.message
      reportError(errorMsg)
      throw err
    } finally {
      setLoading(false)
    }
  }, [reportError])

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
    addLabsBatch,
    addMAREntry,
    editResource,
    addAddendumToResource,
    markResourceInError,
    addOrder,
    updatePatientFields,
    fetchMyCourses,
    joinCourse,
    adminCreateCourse,
    adminUpdateCourse,
    adminRegenerateCourseCode,
    adminCreatePatient,
    adminListAccounts,
    adminCreateAccount,
    adminUpdateAccount,
  }
}
