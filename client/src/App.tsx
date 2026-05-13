import React, { useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import LoginPage from 'pages/LoginPage'
import SignUpPage from 'pages/SignUpPage'
import CourseSelectionPage from 'pages/CourseSelectionPage'
import PatientListPage from 'pages/PatientListPage'
import DashboardPage from 'pages/DashboardPage'

const App = () => {
  const { isLoggedIn, logout } = useAuth()
  const { selectedCourse, selectedPatient, setSelectedCourse, setSelectedPatient } =
    useAppStore()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')

  // Show login or signup page if not logged in
  if (!isLoggedIn) {
    if (authView === 'signup') {
      return <SignUpPage onSwitchToLogin={() => setAuthView('login')} />
    }
    return <LoginPage onSwitchToSignUp={() => setAuthView('signup')} />
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
        setAuthView('login')
      }}
      onChangePatient={() => {
        setSelectedPatient(null)
      }}
    />
  )
}

export default App
