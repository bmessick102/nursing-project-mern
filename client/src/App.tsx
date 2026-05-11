import React from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import LoginPage from 'pages/LoginPage'
import CourseSelectionPage from 'pages/CourseSelectionPage'
import PatientListPage from 'pages/PatientListPage'
import DashboardPage from 'pages/DashboardPage'

const App = () => {
  const { isLoggedIn, logout } = useAuth()
  const { selectedCourse, selectedPatient, setSelectedCourse, setSelectedPatient } =
    useAppStore()

  // Show login page if not logged in
  if (!isLoggedIn) {
    return <LoginPage />
  }

  // Show course selection if logged in but no course selected
  if (!selectedCourse) {
    return (
      <CourseSelectionPage
        onCourseSelected={() => {
          // Navigate to patient selection
        }}
      />
    )
  }

  // Show patient list if course selected but no patient selected
  if (!selectedPatient) {
    return (
      <PatientListPage
        onPatientSelected={() => {
          // Navigate to dashboard
        }}
        onBack={() => {
          setSelectedCourse(null)
        }}
      />
    )
  }

  // Show dashboard if both course and patient selected
  return (
    <DashboardPage
      onLogout={() => {
        logout()
        setSelectedCourse(null)
        setSelectedPatient(null)
      }}
      onChangePatient={() => {
        setSelectedPatient(null)
      }}
    />
  )
}

export default App
