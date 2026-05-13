import React, { useState } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import LoginPage from 'pages/LoginPage'
import SignUpPage from 'pages/SignUpPage'
import CourseSelectionPage from 'pages/CourseSelectionPage'
import PatientListPage from 'pages/PatientListPage'
import DashboardPage from 'pages/DashboardPage'
import IdleSessionTimer from 'components/common/IdleSessionTimer'

const SkipLink = () => (
  <a href="#main-content" className="skip-link">
    Skip to main content
  </a>
)

const App = () => {
  const { isLoggedIn, logout } = useAuth()
  const { selectedCourse, selectedPatient, setSelectedCourse, setSelectedPatient } =
    useAppStore()
  const [authView, setAuthView] = useState<'login' | 'signup'>('login')

  // Show login or signup page if not logged in
  if (!isLoggedIn) {
    return (
      <>
        <SkipLink />
        <main id="main-content" tabIndex={-1}>
          {authView === 'signup' ? (
            <SignUpPage onSwitchToLogin={() => setAuthView('login')} />
          ) : (
            <LoginPage onSwitchToSignUp={() => setAuthView('signup')} />
          )}
        </main>
      </>
    )
  }

  // Show course selection if logged in but no course selected
  if (!selectedCourse) {
    return (
      <>
        <SkipLink />
        <IdleSessionTimer />
        <main id="main-content" tabIndex={-1}>
          <CourseSelectionPage onCourseSelected={() => {}} />
        </main>
      </>
    )
  }

  // Show patient list if course selected but no patient selected
  if (!selectedPatient) {
    return (
      <>
        <SkipLink />
        <IdleSessionTimer />
        <main id="main-content" tabIndex={-1}>
          <PatientListPage
            onPatientSelected={() => {}}
            onBack={() => setSelectedCourse(null)}
          />
        </main>
      </>
    )
  }

  // Show dashboard if both course and patient selected
  return (
    <>
      <SkipLink />
      <IdleSessionTimer />
      <main id="main-content" tabIndex={-1}>
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
      </main>
    </>
  )
}

export default App
