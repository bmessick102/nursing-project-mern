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
  Snackbar,
  Alert,
} from '@mui/material'
import { Refresh, ContentCopy, Edit as EditIcon, OpenInNew, Delete as DeleteIcon } from '@mui/icons-material'
import type { Course, Patient, NoteTemplate } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import { useSnackbar } from 'contexts/SnackbarContext'
import EmptyState from 'components/common/EmptyState'
import SearchableSelect from 'components/common/SearchableSelect'
import CreateCourseDialog from 'components/admin/CreateCourseDialog'
import CreatePatientDialog from 'components/admin/CreatePatientDialog'
import RegenerateCodeDialog from 'components/admin/RegenerateCodeDialog'
import CreateAccountDialog from 'components/admin/CreateAccountDialog'
import EditAccountDialog from 'components/admin/EditAccountDialog'
import NoteTemplateDialog from 'components/admin/NoteTemplateDialog'
import GradeDialog from 'components/admin/GradeDialog'
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

interface StudentInstanceRow {
  _id: string
  ownerAccountId: string
  studentName: string
  noteCount: number
  updatedAt: string
}

interface PeerReviewRow {
  _id: string
  reviewerName: string
  revieweeName: string
  status: string
  createdAt: string
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
    adminListInstances,
    adminGradeInstance,
    adminCreatePeerReview,
    adminListPeerReviews,
    listNoteTemplates,
    createNoteTemplate,
    updateNoteTemplate,
    deleteNoteTemplate,
    loading,
  } = useChartingApi()
  const { displayName, username } = useCurrentUser()
  const { account: callerAccount, logout } = useAuth()
  const { setSelectedCourse, setSelectedPatient } = useAppStore()
  const { notifySuccess, notifyError } = useSnackbar()

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
  const [reviewCourseId, setReviewCourseId] = useState('')
  const [reviewCaseStudies, setReviewCaseStudies] = useState<Patient[]>([])
  const [reviewCaseStudyId, setReviewCaseStudyId] = useState('')
  const [reviewInstances, setReviewInstances] = useState<StudentInstanceRow[]>([])
  const [peerReviews, setPeerReviews] = useState<PeerReviewRow[]>([])
  const [prReviewer, setPrReviewer] = useState('')
  const [prReviewee, setPrReviewee] = useState('')
  const [gradingRow, setGradingRow] = useState<StudentInstanceRow | null>(null)
  const [templates, setTemplates] = useState<NoteTemplate[]>([])
  const [templateCourseId, setTemplateCourseId] = useState<string>('')
  const [templateDialogOpen, setTemplateDialogOpen] = useState(false)
  const [editingTemplate, setEditingTemplate] = useState<NoteTemplate | null>(null)

  const loadCourses = useCallback(async () => {
    try {
      const data = await fetchCourses()
      setCourses(data)
      if (!filterCourseId && data[0]) setFilterCourseId(data[0]._id)
      if (!templateCourseId && data[0]) setTemplateCourseId(data[0]._id)
    } catch (err) {
      console.error('Failed to load courses', err)
    }
  }, [fetchCourses, filterCourseId, templateCourseId])

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

  const loadTemplates = useCallback(
    async (courseId: string) => {
      try {
        const data = await listNoteTemplates(courseId || undefined)
        setTemplates(data)
      } catch (err) {
        console.error('Failed to load note templates', err)
      }
    },
    [listNoteTemplates],
  )

  useEffect(() => {
    loadTemplates(templateCourseId)
  }, [templateCourseId, loadTemplates])

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

  const handleCreateTemplate = async (payload: any) => {
    try {
      await createNoteTemplate(payload)
      notifySuccess(`Template "${payload.name}" created.`)
      setTemplateDialogOpen(false)
      setEditingTemplate(null)
      loadTemplates(templateCourseId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleUpdateTemplate = async (payload: any) => {
    if (!editingTemplate) return
    try {
      await updateNoteTemplate(editingTemplate._id, payload)
      notifySuccess(`Template "${payload.name}" updated.`)
      setTemplateDialogOpen(false)
      setEditingTemplate(null)
      loadTemplates(templateCourseId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleDeleteTemplate = async (t: NoteTemplate) => {
    if (!window.confirm(`Delete template "${t.name}"? This cannot be undone.`)) return
    try {
      await deleteNoteTemplate(t._id)
      notifySuccess(`Template "${t.name}" deleted.`)
      loadTemplates(templateCourseId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleOpenChart = (p: Patient) => {
    const course = courses.find((c) => c._id === p.courseId)
    if (course) setSelectedCourse(course)
    setSelectedPatient(p)
    navigate(`/patient/${p._id}/summary`)
  }

  const loadReviewCaseStudies = useCallback(
    async (courseId: string) => {
      if (!courseId) {
        setReviewCaseStudies([])
        return
      }
      try {
        const data = await fetchPatientsByCourse(courseId)
        setReviewCaseStudies(data.filter((p) => p.isCaseStudy))
      } catch (err) {
        console.error('Failed to load case studies', err)
      }
    },
    [fetchPatientsByCourse],
  )

  const loadReviewInstances = useCallback(
    async (templateId: string) => {
      if (!templateId) {
        setReviewInstances([])
        return
      }
      try {
        const data = await adminListInstances(templateId)
        setReviewInstances(data.instances as StudentInstanceRow[])
      } catch (err) {
        console.error('Failed to load student instances', err)
      }
    },
    [adminListInstances],
  )

  const loadPeerReviews = useCallback(
    async (templateId: string) => {
      if (!templateId) {
        setPeerReviews([])
        return
      }
      try {
        const r = await adminListPeerReviews(templateId)
        setPeerReviews((r.reviews as PeerReviewRow[]) || [])
      } catch (err) {
        console.error('Failed to load peer reviews', err)
      }
    },
    [adminListPeerReviews],
  )

  useEffect(() => {
    if (reviewCaseStudyId) loadPeerReviews(reviewCaseStudyId)
    else setPeerReviews([])
  }, [reviewCaseStudyId, loadPeerReviews])

  const handleAssignPeerReview = async () => {
    if (!prReviewer || !prReviewee) return
    const revieweeRow = reviewInstances.find((r) => r._id === prReviewee)
    if (revieweeRow && revieweeRow.ownerAccountId === prReviewer) {
      notifyError('A student cannot be assigned to review their own work.')
      return
    }
    try {
      await adminCreatePeerReview({ reviewerAccountId: prReviewer, revieweeInstanceId: prReviewee })
      notifySuccess('Peer review assigned')
      setPrReviewer('')
      setPrReviewee('')
      loadPeerReviews(reviewCaseStudyId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleReviewCourseChange = (courseId: string) => {
    setReviewCourseId(courseId)
    setReviewCaseStudyId('')
    setReviewInstances([])
    loadReviewCaseStudies(courseId)
  }

  const handleReviewCaseStudyChange = (id: string) => {
    setReviewCaseStudyId(id)
    loadReviewInstances(id)
  }

  const handleGradeSubmit = async (grade: { score: number; maxScore: number; feedback: string }) => {
    if (!gradingRow) return
    try {
      await adminGradeInstance(gradingRow._id, grade)
      notifySuccess('Grade saved for ' + gradingRow.studentName)
      setGradingRow(null)
      loadReviewInstances(reviewCaseStudyId)
    } catch (err) {
      /* surfaced via snackbar */
    }
  }

  const handleOpenStudentNotes = (row: StudentInstanceRow) => {
    const course = courses.find((c) => c._id === reviewCourseId)
    if (course) setSelectedCourse(course)
    setSelectedPatient(null)
    navigate(`/patient/${row._id}/notes`)
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
            <Tab label="Case Study Review" />
            <Tab label="Note Templates" />
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
                <Box sx={{ minWidth: 240 }}>
                  <SearchableSelect
                    label="Filter by Course"
                    placeholder="Search courses…"
                    value={filterCourseId}
                    onChange={setFilterCourseId}
                    options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
                  />
                </Box>
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
                      <TableCell>Availability</TableCell>
                      <TableCell>Actions</TableCell>
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
                        <TableCell sx={{ color: '#595959', fontSize: 13 }}>
                          {p.isCaseStudy
                            ? p.availableFrom
                              ? `${new Date(p.availableFrom).toLocaleDateString()} – ${
                                  p.availableUntil
                                    ? new Date(p.availableUntil).toLocaleDateString()
                                    : 'open'
                                }`
                              : 'immediate'
                            : '—'}
                        </TableCell>
                        <TableCell>
                          <Tooltip title="Open chart · edit clinical data">
                            <IconButton
                              size="small"
                              onClick={() => handleOpenChart(p)}
                              aria-label={`open chart for ${p.name}`}
                            >
                              <OpenInNew fontSize="small" />
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

        {/* CASE STUDY REVIEW */}
        {tab === 3 && (
          <Box>
            <Typography component="h2" variant="h6" sx={{ color: '#003D82', fontWeight: 700, mb: 2 }}>
              Case Study Review
            </Typography>
            <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} sx={{ mb: 3 }}>
              <Box sx={{ minWidth: 260 }}>
                <SearchableSelect
                  label="Course"
                  placeholder="Search courses…"
                  value={reviewCourseId}
                  onChange={handleReviewCourseChange}
                  options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
                />
              </Box>
              <Box sx={{ minWidth: 260 }}>
                <SearchableSelect
                  label="Case study"
                  placeholder="Select a case study…"
                  value={reviewCaseStudyId}
                  onChange={handleReviewCaseStudyChange}
                  options={reviewCaseStudies.map((p) => ({ value: p._id, label: p.name }))}
                />
              </Box>
            </Stack>

            {!reviewCourseId ? (
              <EmptyState message="Select a course to begin." />
            ) : reviewCaseStudies.length === 0 ? (
              <EmptyState message="This course has no case-study patients yet." />
            ) : !reviewCaseStudyId ? (
              <EmptyState message="Select a case study to see student work." />
            ) : reviewInstances.length === 0 ? (
              <EmptyState message="No students have started this case study yet." />
            ) : (
              <TableContainer component={Paper} className={styles.sectionCard}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Student</TableCell>
                      <TableCell>Notes</TableCell>
                      <TableCell>Last updated</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {reviewInstances.map((row) => (
                      <TableRow key={row._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{row.studentName}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={row.noteCount}
                            sx={{ backgroundColor: '#FFFBF0', color: '#003D82', fontWeight: 700 }}
                          />
                        </TableCell>
                        <TableCell sx={{ color: '#595959' }}>
                          {row.updatedAt ? new Date(row.updatedAt).toLocaleString() : '—'}
                        </TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Button
                              size="small"
                              variant="outlined"
                              startIcon={<OpenInNew />}
                              onClick={() => handleOpenStudentNotes(row)}
                            >
                              Open notes
                            </Button>
                            <Button
                              size="small"
                              variant="contained"
                              onClick={() => setGradingRow(row)}
                              sx={{ backgroundColor: '#003D82' }}
                            >
                              Grade
                            </Button>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}

            {reviewInstances.length > 0 && (
              <Box sx={{ mt: 4 }}>
                <Typography
                  component="h3"
                  variant="subtitle1"
                  sx={{ color: '#003D82', fontWeight: 700, mb: 2 }}
                >
                  Assign Peer Review
                </Typography>
                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'flex-end' }}>
                  <Box sx={{ minWidth: 260 }}>
                    <SearchableSelect
                      label="Reviewer"
                      placeholder="Select a student…"
                      value={prReviewer}
                      onChange={setPrReviewer}
                      options={reviewInstances.map((r) => ({ value: r.ownerAccountId, label: r.studentName }))}
                    />
                  </Box>
                  <Box sx={{ minWidth: 260 }}>
                    <SearchableSelect
                      label="Reviews"
                      placeholder="Select student work…"
                      value={prReviewee}
                      onChange={setPrReviewee}
                      options={reviewInstances.map((r) => ({ value: r._id, label: r.studentName }))}
                    />
                  </Box>
                  <Button
                    variant="contained"
                    disabled={!prReviewer || !prReviewee}
                    onClick={handleAssignPeerReview}
                    sx={{ backgroundColor: '#003D82' }}
                  >
                    Assign
                  </Button>
                </Stack>

                {peerReviews.length > 0 && (
                  <TableContainer component={Paper} className={styles.sectionCard} sx={{ mt: 3 }}>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Reviewer</TableCell>
                          <TableCell>Reviews</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Assigned</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {peerReviews.map((pr) => (
                          <TableRow key={pr._id} hover>
                            <TableCell sx={{ fontWeight: 600 }}>{pr.reviewerName}</TableCell>
                            <TableCell>{pr.revieweeName}</TableCell>
                            <TableCell>
                              <Chip
                                size="small"
                                label={pr.status}
                                sx={{
                                  backgroundColor: '#FFFBF0',
                                  color: '#003D82',
                                  fontWeight: 700,
                                  textTransform: 'capitalize',
                                }}
                              />
                            </TableCell>
                            <TableCell sx={{ color: '#595959' }}>
                              {pr.createdAt ? new Date(pr.createdAt).toLocaleDateString() : '—'}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Box>
            )}
          </Box>
        )}

        {/* NOTE TEMPLATES */}
        {tab === 4 && (
          <Box>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              sx={{ mb: 2 }}
            >
              <Stack direction="row" alignItems="center" spacing={2}>
                <Typography component="h2" variant="h6" sx={{ color: '#003D82', fontWeight: 700 }}>
                  Note Templates
                </Typography>
                <Box sx={{ minWidth: 240 }}>
                  <SearchableSelect
                    label="Filter by Course"
                    placeholder="Search courses…"
                    value={templateCourseId}
                    onChange={setTemplateCourseId}
                    options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
                  />
                </Box>
              </Stack>
              <Button
                variant="contained"
                onClick={() => {
                  setEditingTemplate(null)
                  setTemplateDialogOpen(true)
                }}
                sx={{ backgroundColor: '#003D82' }}
              >
                New Template
              </Button>
            </Stack>

            {templates.length === 0 ? (
              <EmptyState
                message="No note templates yet."
                actionHint='Use "New Template" to create one. Global templates apply to all courses.'
              />
            ) : (
              <TableContainer component={Paper} className={styles.sectionCard}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Name</TableCell>
                      <TableCell>Scope</TableCell>
                      <TableCell>Format</TableCell>
                      <TableCell>Default role</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {templates.map((t) => (
                      <TableRow key={t._id} hover>
                        <TableCell sx={{ fontWeight: 600 }}>{t.name}</TableCell>
                        <TableCell>
                          <Chip
                            size="small"
                            label={
                              t.courseId
                                ? courses.find((c) => c._id === t.courseId)?.name || 'Course'
                                : 'Global'
                            }
                            sx={{
                              backgroundColor: t.courseId ? '#F4F4F4' : '#FFFBF0',
                              color: '#003D82',
                              fontWeight: 700,
                            }}
                          />
                        </TableCell>
                        <TableCell sx={{ textTransform: 'uppercase', fontSize: 12, color: '#595959' }}>
                          {t.format === 'soap' ? 'SOAP' : 'Free text'}
                        </TableCell>
                        <TableCell sx={{ color: '#595959' }}>{t.defaultRole || '—'}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1}>
                            <Tooltip title="Edit template">
                              <IconButton
                                size="small"
                                onClick={() => {
                                  setEditingTemplate(t)
                                  setTemplateDialogOpen(true)
                                }}
                                aria-label={`edit template ${t.name}`}
                              >
                                <EditIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                            <Tooltip title="Delete template">
                              <IconButton
                                size="small"
                                onClick={() => handleDeleteTemplate(t)}
                                aria-label={`delete template ${t.name}`}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Tooltip>
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
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
      <NoteTemplateDialog
        open={templateDialogOpen}
        loading={loading}
        courses={courses}
        initial={editingTemplate}
        onClose={() => {
          setTemplateDialogOpen(false)
          setEditingTemplate(null)
        }}
        onSubmit={editingTemplate ? handleUpdateTemplate : handleCreateTemplate}
      />

      <GradeDialog
        open={gradingRow !== null}
        loading={loading}
        studentName={gradingRow?.studentName}
        onClose={() => setGradingRow(null)}
        onSubmit={handleGradeSubmit}
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
