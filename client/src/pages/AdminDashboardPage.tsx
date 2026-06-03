import React, { useCallback, useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Tabs,
  Tab,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TableContainer,
  Paper,
  Chip,
  IconButton,
  Stack,
  Tooltip,
  CircularProgress,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Snackbar,
  Alert,
} from '@mui/material'
import { Refresh, ContentCopy, Edit as EditIcon } from '@mui/icons-material'
import type { Course, Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import { useSnackbar } from 'contexts/SnackbarContext'
import EmptyState from 'components/common/EmptyState'
import CreateCourseDialog from 'components/admin/CreateCourseDialog'
import CreatePatientDialog from 'components/admin/CreatePatientDialog'
import RegenerateCodeDialog from 'components/admin/RegenerateCodeDialog'
import CreateAccountDialog from 'components/admin/CreateAccountDialog'
import EditAccountDialog from 'components/admin/EditAccountDialog'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import styles from 'styles/AdminDashboardPage.module.css'

interface AdminAccount {
  _id: string
  username: string
  role: string
  firstName?: string
  lastName?: string
  email?: string
  enrolledCourseIds?: string[]
  createdAt?: string
  active?: boolean
}

const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate()
  const {
    fetchCourses,
    fetchPatientsByCourse,
    adminCreateCourse,
    adminRegenerateCourseCode,
    adminCreatePatient,
    adminListAccounts,
    adminCreateAccount,
    adminUpdateAccount,
    loading,
  } = useChartingApi()
  const { displayName, username } = useCurrentUser()
  const { account: callerAccount, logout } = useAuth()
  const { setSelectedCourse, setSelectedPatient } = useAppStore()
  const { notifySuccess } = useSnackbar()

  const handleLogout = () => {
    logout()
    setSelectedCourse(null)
    setSelectedPatient(null)
    navigate('/login', { replace: true })
  }

  const [tab, setTab] = useState(0)
  const [courses, setCourses] = useState<Course[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [accounts, setAccounts] = useState<AdminAccount[]>([])
  const [filterCourseId, setFilterCourseId] = useState<string>('')
  const [createCourseOpen, setCreateCourseOpen] = useState(false)
  const [createPatientOpen, setCreatePatientOpen] = useState(false)
  const [regenCourse, setRegenCourse] = useState<Course | null>(null)
  const [copySnack, setCopySnack] = useState<string | null>(null)
  const [createAccountOpen, setCreateAccountOpen] = useState(false)
  const [editingAccount, setEditingAccount] = useState<AdminAccount | null>(null)

  const loadCourses = useCallback(async () => {
    try {
      const data = await fetchCourses()
      setCourses(data)
      if (!filterCourseId && data[0]) setFilterCourseId(data[0]._id)
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }, [fetchCourses, filterCourseId])

  const loadPatients = useCallback(
    async (courseId: string) => {
      if (!courseId) {
        setPatients([])
        return
      }
      try {
        const data = await fetchPatientsByCourse(courseId)
        setPatients(data)
      } catch (err) {
        console.error('Failed to load patients', err)
      }
    },
    [fetchPatientsByCourse],
  )

  const loadAccounts = useCallback(async () => {
    try {
      const data = await adminListAccounts()
      setAccounts(data as AdminAccount[])
    } catch (err) {
      console.error('Failed to load accounts', err)
    }
  }, [adminListAccounts])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  useEffect(() => {
    if (filterCourseId) loadPatients(filterCourseId)
  }, [filterCourseId, loadPatients])

  useEffect(() => {
    loadAccounts()
  }, [loadAccounts])

  const handleCreateCourse = async (payload: {
    name: string
    code: string
    instructor: string
    description: string
  }) => {
    try {
      await adminCreateCourse(payload)
      notifySuccess(`Course "${payload.name}" created.`)
      setCreateCourseOpen(false)
      loadCourses()
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleRegenerate = async () => {
    if (!regenCourse) return
    try {
      const updated = await adminRegenerateCourseCode(regenCourse._id)
      notifySuccess(`New code for ${regenCourse.name}: ${updated.inviteCode}`)
      setRegenCourse(null)
      loadCourses()
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleCreatePatient = async (payload: any) => {
    try {
      await adminCreatePatient(payload)
      notifySuccess(`Patient "${payload.name}" added.`)
      setCreatePatientOpen(false)
      if (payload.courseId === filterCourseId) loadPatients(filterCourseId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleCreateAccount = async (payload: any) => {
    try {
      await adminCreateAccount(payload)
      notifySuccess(`Account "${payload.username}" created.`)
      setCreateAccountOpen(false)
      loadAccounts()
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleUpdateAccount = async (patch: any) => {
    if (!editingAccount) return
    try {
      await adminUpdateAccount(editingAccount._id, patch)
      notifySuccess(`Account "${editingAccount.username}" updated.`)
      setEditingAccount(null)
      loadAccounts()
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const copyCode = (code?: string) => {
    if (!code) return
    if (navigator.clipboard) {
      navigator.clipboard.writeText(code).catch(() => {})
    }
    setCopySnack(`Copied: ${code}`)
  }

  const enrollmentCountByCourse = useMemo(() => {
    const map = new Map<string, number>()
    for (const c of courses) {
      map.set(c._id, (c.enrolledAccountIds || []).length)
    }
    return map
  }, [courses])

  return (
    <Box className={styles.pageWrap}>

      <Box className={styles.heroBanner}>
        <Container maxWidth="xl" className={styles.heroInner}>
          <Box className={styles.heroBranding}>
            <div className={styles.heroLogo}>
              <img src="/images/logo.jpg" alt="CUW School of Nursing" />
            </div>
            <Box>
              <span className={styles.heroEyebrow}>Administrator Console</span>
              <Typography variant="h4" component="h1" className={styles.heroTitle}>
                CUW Charting · Admin
              </Typography>
              <div className={styles.heroAccountLine}>
                Signed in as <strong>{displayName}</strong> ({username})
              </div>
            </Box>
          </Box>
          <Box className={styles.heroActions}>
            <Button variant="outlined" sx={{ color: '#fff', borderColor: '#fff' }} onClick={handleLogout}>
              Sign Out
            </Button>
          </Box>
        </Container>
      </Box>

      <Box className={styles.tabsBar}>
        <Container maxWidth="xl">
          <Tabs
            value={tab}
            onChange={(_, v) => setTab(v)}
            aria-label="Administrator console sections"
          >
            <Tab label={`Courses (${courses.length})`} />
            <Tab label={`Patients (${patients.length})`} />
            <Tab label={`Accounts (${accounts.length})`} />
          </Tabs>
        </Container>
      </Box>

      <Container maxWidth="xl" className={styles.content}>
        {/* COURSES */}
        {tab === 0 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography component="h2" variant="h6" sx={{ color: '#003D82', fontWeight: 700 }}>
                Courses
              </Typography>
              <Button
                variant="contained"
                onClick={() => setCreateCourseOpen(true)}
                sx={{ backgroundColor: '#003D82' }}
              >
                Create Course
              </Button>
            </Stack>

            {courses.length === 0 ? (
              <EmptyState
                message="No courses yet."
                actionHint='Click "Create Course" to add the first one.'
              />
            ) : (
              <TableContainer component={Paper} className={styles.sectionCard}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Code</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Instructor</TableCell>
                      <TableCell>Enrolled</TableCell>
                      <TableCell>Join Code</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {courses.map((c) => (
                      <TableRow key={c._id} hover>
                        <TableCell sx={{ fontWeight: 700 }}>{c.code}</TableCell>
                        <TableCell>{c.name}</TableCell>
                        <TableCell sx={{ color: '#595959' }}>{c.instructor}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={enrollmentCountByCourse.get(c._id) ?? 0}
                            sx={{ backgroundColor: '#FFFBF0', color: '#003D82', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" alignItems="center" spacing={1}>
                            <span className={styles.codeBadge}>{c.inviteCode || '—'}</span>
                            <Tooltip title="Copy code">
                              <IconButton
                                size="small"
                                onClick={() => copyCode(c.inviteCode)}
                                aria-label="copy course code"
                              >
                                <ContentCopy fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Regenerate code (revokes old)">
                            <IconButton
                              size="small"
                              onClick={() => setRegenCourse(c)}
                              aria-label="regenerate course code"
                            >
                              <Refresh fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* PATIENTS */}
        {tab === 1 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography component="h2" variant="h6" sx={{ color: '#003D82', fontWeight: 700 }}>
                  Patients
                </Typography>
                <FormControl size="small" sx={{ minWidth: 240 }}>
                  <InputLabel id="admin-patient-filter">Filter by Course</InputLabel>
                  <Select
                    labelId="admin-patient-filter"
                    label="Filter by Course"
                    value={filterCourseId}
                    onChange={(e) => setFilterCourseId(e.target.value as string)}
                  >
                    {courses.map((c) => (
                      <MenuItem key={c._id} value={c._id}>
                        {c.name} ({c.code})
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Stack>
              <Button
                variant="contained"
                onClick={() => setCreatePatientOpen(true)}
                disabled={courses.length === 0}
                sx={{ backgroundColor: '#003D82' }}
              >
                Add Patient
              </Button>
            </Stack>

            {loading && patients.length === 0 ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <CircularProgress />
              </Box>
            ) : patients.length === 0 ? (
              <EmptyState
                message="No patients in this course yet."
                actionHint='Use "Add Patient" to create one.'
              />
            ) : (
              <TableContainer component={Paper} className={styles.sectionCard}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Age</TableCell>
                      <TableCell>Gender</TableCell>
                      <TableCell>Room</TableCell>
                      <TableCell>Diagnoses</TableCell>
                      <TableCell>Allergies</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {patients.map((p) => (
                      <TableRow key={p._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{p.name}</TableCell>
                        <TableCell>{p.age}</TableCell>
                        <TableCell>{p.gender}</TableCell>
                        <TableCell>{p.roomNumber}</TableCell>
                        <TableCell sx={{ color: '#595959', fontSize: 13 }}>
                          {(p.diagnosis || []).join(', ') || '—'}
                        </TableCell>
                        <TableCell sx={{ color: '#B71C1C', fontSize: 13, fontWeight: 600 }}>
                          {(p.allergies || []).join(', ') || '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}

        {/* ACCOUNTS */}
        {tab === 2 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Typography component="h2" variant="h6" sx={{ color: '#003D82', fontWeight: 700 }}>
                Accounts
              </Typography>
              <Stack direction="row" spacing={1}>
                <Button variant="outlined" onClick={loadAccounts} startIcon={<Refresh />}>
                  Refresh
                </Button>
                <Button
                  variant="contained"
                  onClick={() => setCreateAccountOpen(true)}
                  sx={{ backgroundColor: '#003D82' }}
                >
                  Create Account
                </Button>
              </Stack>
            </Stack>

            {accounts.length === 0 ? (
              <EmptyState message="No accounts loaded." />
            ) : (
              <TableContainer component={Paper} className={styles.sectionCard}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Username</TableCell>
                      <TableCell>Name</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Role</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Enrolled</TableCell>
                      <TableCell>Created</TableCell>
                      <TableCell></TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {accounts.map((a) => {
                      const isInactive = a.active === false
                      const isSelf = a._id === callerAccount?._id
                      return (
                        <TableRow
                          key={a._id}
                          hover
                          sx={{ opacity: isInactive ? 0.55 : 1 }}
                        >
                          <TableCell sx={{ fontWeight: 600 }}>{a.username}</TableCell>
                          <TableCell>
                            {[a.firstName, a.lastName].filter(Boolean).join(' ') || '—'}
                          </TableCell>
                          <TableCell sx={{ color: '#595959' }}>{a.email || '—'}</TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={a.role}
                              sx={{
                                backgroundColor:
                                  a.role === 'administrator' || a.role === 'admin'
                                    ? '#FFFBF0'
                                    : '#F4F4F4',
                                color:
                                  a.role === 'administrator' || a.role === 'admin'
                                    ? '#003D82'
                                    : '#595959',
                                fontWeight: 700,
                                textTransform: 'capitalize',
                              }}
                            />
                          </TableCell>
                          <TableCell>
                            <Chip
                              size="small"
                              label={isInactive ? 'Inactive' : 'Active'}
                              sx={{
                                backgroundColor: isInactive ? '#fdecea' : '#E8F5E9',
                                color: isInactive ? '#B71C1C' : '#2e7d32',
                                fontWeight: 700,
                              }}
                            />
                          </TableCell>
                          <TableCell>{(a.enrolledCourseIds || []).length}</TableCell>
                          <TableCell sx={{ color: '#595959' }}>
                            {a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}
                          </TableCell>
                          <TableCell>
                            <Tooltip title={isSelf ? 'Edit your account' : 'Edit account'}>
                              <IconButton
                                size="small"
                                onClick={() => setEditingAccount(a)}
                                aria-label={`edit account ${a.username}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Box>
        )}
      </Container>

      <CreateCourseDialog
        open={createCourseOpen}
        loading={loading}
        onClose={() => setCreateCourseOpen(false)}
        onSubmit={handleCreateCourse}
      />
      <CreatePatientDialog
        open={createPatientOpen}
        loading={loading}
        courses={courses}
        defaultCourseId={filterCourseId || null}
        onClose={() => setCreatePatientOpen(false)}
        onSubmit={handleCreatePatient}
      />
      <RegenerateCodeDialog
        open={regenCourse !== null}
        loading={loading}
        courseName={regenCourse?.name}
        currentCode={regenCourse?.inviteCode}
        onClose={() => setRegenCourse(null)}
        onConfirm={handleRegenerate}
      />
      <CreateAccountDialog
        open={createAccountOpen}
        loading={loading}
        onClose={() => setCreateAccountOpen(false)}
        onSubmit={handleCreateAccount}
      />
      <EditAccountDialog
        open={editingAccount !== null}
        loading={loading}
        account={editingAccount}
        isSelf={editingAccount?._id === callerAccount?._id}
        onClose={() => setEditingAccount(null)}
        onSubmit={handleUpdateAccount}
      />

      <Snackbar
        open={!!copySnack}
        autoHideDuration={2200}
        onClose={() => setCopySnack(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert severity="success" variant="filled" onClose={() => setCopySnack(null)}>
          {copySnack}
        </Alert>
      </Snackbar>
    </Box>
  )
}

export default AdminDashboardPage
