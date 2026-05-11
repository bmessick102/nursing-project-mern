import React, { useEffect, useState } from 'react'
import {
  Box,
  Container,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  Typography,
  CircularProgress,
  Alert,
  Paper,
} from '@mui/material'
import type { Course } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useAppStore } from 'store/useAppStore'
import { useAuth } from 'contexts/AuthContext'
import UtilityBar from 'components/UtilityBar'
import Footer from 'components/Footer'
import styles from 'styles/CourseSelectionPage.module.css'

interface CourseSelectionPageProps {
  onCourseSelected: () => void
}

const CourseSelectionPage: React.FC<CourseSelectionPageProps> = ({
  onCourseSelected,
}) => {
  const { fetchCourses, loading, error } = useChartingApi()
  const [courses, setCourses] = useState<Course[]>([])
  const [tempSelectedCourse, setTempSelectedCourse] = useState<Course | null>(null)
  const { setSelectedCourse } = useAppStore()
  const { logout } = useAuth()

  useEffect(() => {
    const loadCourses = async () => {
      try {
        const data = await fetchCourses()
        setCourses(data)
      } catch (err) {
        console.error('Failed to load courses:', err)
      }
    }

    loadCourses()
  }, [fetchCourses])

  const handleContinue = () => {
    if (tempSelectedCourse) {
      setSelectedCourse(tempSelectedCourse)
      onCourseSelected()
    }
  }

  return (
    <Box className={styles.pageWrap}>
      <UtilityBar showLogout onLogout={logout} />
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

          {error && <Alert severity="error">{error}</Alert>}

          {loading ? (
            <Box className={styles.loadingContainer}>
              <CircularProgress />
            </Box>
          ) : (
            <FormControl fullWidth sx={{ my: 3 }}>
              <InputLabel>Department/Course</InputLabel>
              <Select
                value={tempSelectedCourse?._id || ''}
                onChange={(e) => {
                  const course = courses.find((c) => c._id === e.target.value)
                  setTempSelectedCourse(course || null)
                }}
                label="Department/Course"
              >
                <MenuItem value="">
                  <em>Select a course</em>
                </MenuItem>
                {courses.map((course) => (
                  <MenuItem key={course._id} value={course._id}>
                    {course.name} ({course.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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

            <Box className={styles.buttonGroup} sx={{ display: 'flex', gap: 2 }}>
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
      <Footer />
    </Box>
  )
}

export default CourseSelectionPage
