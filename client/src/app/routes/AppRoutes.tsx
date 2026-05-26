import React, { lazy, Suspense, useEffect } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { Box, CircularProgress } from '@mui/material'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'

// Layout + guards (eager — always needed)
import AppShell from 'app/layouts/AppShell'
import PublicShell from 'app/layouts/PublicShell'
import PatientLayout from 'app/layouts/PatientLayout'
import RequireAuth from 'app/routes/RequireAuth'
import RequireAdmin from 'app/routes/RequireAdmin'

// Auth pages (eager — first paint for unauthenticated users)
import LoginPage from 'pages/LoginPage'
import SignUpPage from 'pages/SignUpPage'

// All other pages (lazy — code split)
const CourseSelectionPage = lazy(() =>
  import('pages/CourseSelectionPage')
)
const PatientListPage = lazy(() => import('pages/PatientListPage'))
const AdminDashboardPage = lazy(() => import('pages/AdminDashboardPage'))
const SummaryTab = lazy(() => import('components/tabs/SummaryTab'))
const ChartReviewTab = lazy(() => import('components/tabs/ChartReviewTab'))
const ResultsTab = lazy(() => import('components/tabs/ResultsTab'))
const MARTab = lazy(() => import('components/tabs/MARTab'))
const FlowsheetsTab = lazy(() => import('components/tabs/FlowsheetsTab'))
const AssessmentsTab = lazy(() => import('components/tabs/AssessmentsTab'))
const IOTab = lazy(() => import('components/tabs/IOTab'))
const NotesTab = lazy(() => import('components/tabs/NotesTab'))
const OrdersTab = lazy(() => import('components/tabs/OrdersTab'))

const Fallback = () => (
  <Box sx={{ display: 'flex', justifyContent: 'center', pt: 8 }}>
    <CircularProgress />
  </Box>
)

const S = (C: React.LazyExoticComponent<any>) => (
  <Suspense fallback={<Fallback />}>
    <C />
  </Suspense>
)

// Smart root redirect — sends user to the right place based on auth state
const SmartRoot: React.FC = () => {
  const { isLoggedIn, account, initializing } = useAuth()
  const { selectedCourse, selectedPatient } = useAppStore()

  if (initializing) return <Fallback />
  if (!isLoggedIn) return <Navigate to="/login" replace />

  const isAdmin =
    account?.role === 'administrator' || account?.role === 'admin'
  if (isAdmin) return <Navigate to="/admin" replace />
  if (!selectedCourse) return <Navigate to="/course-select" replace />
  if (!selectedPatient) return <Navigate to="/patients" replace />
  return (
    <Navigate
      to={`/patient/${selectedPatient._id}/summary`}
      replace
    />
  )
}

const AppRoutes: React.FC = () => {
  const { isLoggedIn } = useAuth()
  const { setSelectedCourse, setSelectedPatient } = useAppStore()

  // Clear app state whenever the user logs out, regardless of which logout
  // path was used (TopBar Sign Out, "Back to Login", cross-tab, idle timeout).
  // Without this, selectedCourse persists in Zustand and SmartRoot skips
  // course-select on the next login.
  useEffect(() => {
    if (!isLoggedIn) {
      setSelectedCourse(null)
      setSelectedPatient(null)
    }
  }, [isLoggedIn, setSelectedCourse, setSelectedPatient])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<SmartRoot />} />

        {/* Public / pre-roster pages — shared chrome (UtilityBar + MainHeader +
            Footer) via PublicShell, no sidebar. */}
        <Route element={<PublicShell />}>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignUpPage />} />

          {/* Course select — requires auth, no course */}
          <Route element={<RequireAuth requireCourse={false} />}>
            <Route path="/course-select" element={S(CourseSelectionPage)} />
          </Route>
        </Route>

        {/* Admin routes */}
        <Route element={<RequireAdmin />}>
          <Route element={<AppShell />}>
            <Route path="/admin" element={S(AdminDashboardPage)} />
          </Route>
        </Route>

        {/* All other authenticated routes — require auth + course */}
        <Route element={<RequireAuth requireCourse={true} />}>
          <Route element={<AppShell />}>
            <Route path="/patients" element={S(PatientListPage)} />

            <Route path="/patient/:patientId" element={<PatientLayout />}>
              <Route index element={<Navigate to="summary" replace />} />
              <Route path="summary" element={S(SummaryTab)} />
              <Route path="chart" element={S(ChartReviewTab)} />
              <Route path="results" element={S(ResultsTab)} />
              <Route path="mar" element={S(MARTab)} />
              <Route path="flowsheets" element={S(FlowsheetsTab)} />
              <Route path="assessments" element={S(AssessmentsTab)} />
              <Route path="io" element={S(IOTab)} />
              <Route path="notes" element={S(NotesTab)} />
              <Route path="orders" element={S(OrdersTab)} />
            </Route>
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default AppRoutes
