import React, { useEffect, useState, useCallback } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  TextField,
  Stack,
  Divider,
  InputAdornment,
} from '@mui/material'
import { VpnKey } from '@mui/icons-material'
import type { Course } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useAppStore } from 'store/useAppStore'
import { useAuth } from 'contexts/AuthContext'
import { useSnackbar } from 'contexts/SnackbarContext'
import SearchableSelect from 'components/common/SearchableSelect'
import styles from 'styles/CourseSelectionPage.module.css'

const CourseSelectionPage: React.FC = () => {
  const navigate = useNavigate()
  const { fetchMyCourses, joinCourse, loading, error } = useChartingApi()
  const [courses, setCourses] = useState<Course[]>([])
  const [tempSelectedCourse, setTempSelectedCourse] = useState<Course | null>(null)
  const [joinCode, setJoinCode] = useState('')
  const [joining, setJoining] = useState(false)
  const { setSelectedCourse } = useAppStore()
  const { logout } = useAuth()
  const { notifySuccess } = useSnackbar()

  const loadCourses = useCallback(async () => {
    try {
      const data = await fetchMyCourses()
      setCourses(data)
    } catch (err) {
      console.error('Failed to load enrolled courses:', err)
    }
  }, [fetchMyCourses])

  useEffect(() => {
    loadCourses()
  }, [loadCourses])

  const handleContinue = () => {
    if (tempSelectedCourse) {
      setSelectedCourse(tempSelectedCourse)
      navigate('/patients')
    }
  }

  const handleJoin = async () => {
    if (!joinCode.trim()) return
    setJoining(true)
    try {
      const result = await joinCourse(joinCode.trim())
      notifySuccess(`Joined ${result.course.name}`)
      setJoinCode('')
      await loadCourses()
      // auto-select the freshly joined course
      setTempSelectedCourse(result.course)
    } catch (err) {
      // error already surfaced via Snackbar
    } finally {
      setJoining(false)
    }
  }

  const hasCourses = courses.length > 0

  return (
    <Box className={styles.pageWrap}>
      <Box className={styles.courseContainer}>
        <div className={styles.backgroundLeft}></div>
        <div className={styles.backgroundRight}></div>

        <Container maxWidth="sm" className={styles.courseContent}>
          <Box className={styles.eyebrowBlock}>
            <span className={styles.eyebrowText}>School of Nursing</span>
            <span className={styles.eyebrowDot} />
            <span className={styles.eyebrowText}>Clinical Charting</span>
          </Box>
          <Paper className={styles.courseBox} elevation={3}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
              <img
                src="/images/logo.jpg"
                alt="Concordia University Wisconsin · School of Nursing"
                style={{ width: '300px', height: 'auto', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h4" className={styles.title}>
              Select Your Course
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 1 }}>
                {error}
              </Alert>
            )}

            {loading && !hasCourses ? (
              <Box className={styles.loadingContainer}>
                <CircularProgress />
              </Box>
            ) : !hasCourses ? (
              <Alert severity="info" sx={{ my: 2 }}>
                You haven&rsquo;t joined any courses yet. Enter the course code your
                instructor gave you below.
              </Alert>
            ) : (
              <Box sx={{ my: 3 }}>
                <SearchableSelect
                  label="Department/Course"
                  placeholder="Search your courses…"
                  size="medium"
                  value={tempSelectedCourse?._id || ''}
                  onChange={(value) => {
                    const course = courses.find((c) => c._id === value)
                    setTempSelectedCourse(course || null)
                  }}
                  options={courses.map((course) => ({
                    value: course._id,
                    label: `${course.name} (${course.code})`,
                  }))}
                />
              </Box>
            )}

            {tempSelectedCourse && (
              <Paper className={styles.courseDetails} variant="outlined">
                <Typography variant="body2">
                  <strong>Code:</strong> {tempSelectedCourse.code}
                </Typography>
                <Typography variant="body2">
                  <strong>Instructor:</strong> {tempSelectedCourse.instructor}
                </Typography>
                <Typography variant="body2">
                  <strong>Description:</strong> {tempSelectedCourse.description}
                </Typography>
              </Paper>
            )}

            <Divider sx={{ my: 2 }}>
              <Typography variant="caption" sx={{ color: '#595959' }}>
                JOIN A COURSE
              </Typography>
            </Divider>

            <Stack spacing={1}>
              <Typography variant="caption" sx={{ color: '#595959' }}>
                Paste the course code your instructor gave you.
              </Typography>
              <Stack direction="row" spacing={1}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="e.g., NURS-201-7K3X9P"
                  value={joinCode}
                  onChange={(e) => setJoinCode(e.target.value)}
                  disabled={joining}
                  inputProps={{ spellCheck: false, autoCapitalize: 'characters' }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <VpnKey fontSize="small" sx={{ color: '#003D82' }} />
                      </InputAdornment>
                    ),
                  }}
                />
                <Button
                  variant="outlined"
                  color="primary"
                  onClick={handleJoin}
                  disabled={!joinCode.trim() || joining}
                >
                  {joining ? <CircularProgress size={20} /> : 'Join'}
                </Button>
              </Stack>
            </Stack>

            <Box className={styles.buttonGroup} sx={{ display: 'flex', gap: 2, mt: 3 }}>
              <Button
                variant="outlined"
                color="primary"
                onClick={logout}
                sx={{ flex: 1 }}
              >
                Back to Login
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleContinue}
                disabled={!tempSelectedCourse || loading}
                sx={{ flex: 1 }}
              >
                Continue
              </Button>
            </Box>
          </Paper>
        </Container>
      </Box>
    </Box>
  )
}

export default CourseSelectionPage
