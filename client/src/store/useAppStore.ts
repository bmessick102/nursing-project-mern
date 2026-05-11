import { create } from 'zustand'
import type { Course, Patient } from '@types'

interface AppState {
  selectedCourse: Course | null
  selectedPatient: Patient | null
  setSelectedCourse: (course: Course | null) => void
  setSelectedPatient: (patient: Patient | null) => void
  currentTab: string
  setCurrentTab: (tab: string) => void
}

export const useAppStore = create<AppState>((set) => ({
  selectedCourse: null,
  selectedPatient: null,
  setSelectedCourse: (course) => set({ selectedCourse: course }),
  setSelectedPatient: (patient) => set({ selectedPatient: patient }),
  currentTab: 'summary',
  setCurrentTab: (tab) => set({ currentTab: tab }),
}))
