import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  CircularProgress,
  Alert,
  Paper,
  ListItemButton,
  Chip,
  Button,
  Grid,
  TextField,
  InputAdornment,
  Stack,
} from '@mui/material'
import { Search, Warning as WarningIcon } from '@mui/icons-material'
import type { Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useAppStore } from 'store/useAppStore'
import styles from 'styles/PatientListPage.module.css'

const PatientListPage: React.FC = () => {
  const navigate = useNavigate()
  const { fetchPatientsByCourse, loading, error } = useChartingApi()
  const [patients, setPatients] = useState<Patient[]>([])
  const [query, setQuery] = useState('')
  const [allergiesOnly, setAllergiesOnly] = useState(false)
  const { selectedCourse, selectedPatient, setSelectedPatient } = useAppStore()

  useEffect(() => {
    const loadPatients = async () => {
      if (!selectedCourse) return

      try {
        const data = await fetchPatientsByCourse(selectedCourse._id)
        setPatients(data)
      } catch (err) {
        console.error('Failed to load patients:', err)
      }
    }

    loadPatients()
  }, [selectedCourse, fetchPatientsByCourse])

  const handlePatientSelect = (patient: Patient) => {
    setSelectedPatient(patient)
    navigate(`/patient/${patient._id}/summary`)
  }

  const normalizedQuery = query.trim().toLowerCase()
  const filteredPatients = patients.filter((patient) => {
    if (allergiesOnly && (!patient.allergies || patient.allergies.length === 0)) {
      return false
    }
    if (!normalizedQuery) return true
    const haystack = [
      patient.name,
      patient.roomNumber,
      ...(patient.diagnosis || []),
      ...(patient.allergies || []),
    ]
      .join(' ')
      .toLowerCase()
    return haystack.includes(normalizedQuery)
  })

  return (
    <Box className={styles.patientContainer}>
      <Box className={styles.heroBanner}>
        <Box className={styles.heroImage} />
        <Box className={styles.heroOverlay} />
        <Container maxWidth="md" className={styles.heroInner}>
          <Box className={styles.header}>
            <Box className={styles.headerContent}>
              <Box className={styles.brandLockup}>
                <img
                  src="/images/logo.jpg"
                  alt="CUW School of Nursing"
                  className={styles.brandLogo}
                />
              </Box>
              <Typography component="span" className={styles.eyebrow}>
                A Passion for Healing
              </Typography>
              <Typography variant="h3" className={styles.title}>
                Patient Roster
              </Typography>
              <Typography variant="body1" className={styles.courseName}>
                {selectedCourse?.name}
              </Typography>
            </Box>
            <Button
              variant="contained"
              onClick={() => navigate('/course-select')}
              className={styles.backButton}
            >
              Back to Courses
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {patients.length > 0 && (
          <Stack direction="row" spacing={2} alignItems="center" sx={{ my: 2 }}>
            <TextField
              size="small"
              placeholder="Search by name, room, or diagnosis…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search fontSize="small" />
                  </InputAdornment>
                ),
              }}
            />
            <Chip
              label="Allergies only"
              clickable
              color={allergiesOnly ? 'primary' : 'default'}
              variant={allergiesOnly ? 'filled' : 'outlined'}
              onClick={() => setAllergiesOnly((v) => !v)}
            />
            <Typography variant="caption" sx={{ color: '#666', whiteSpace: 'nowrap' }}>
              {filteredPatients.length} / {patients.length}
            </Typography>
          </Stack>
        )}

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : patients.length === 0 ? (
          <Alert severity="info">No patients available for this course</Alert>
        ) : filteredPatients.length === 0 ? (
          <Alert severity="warning">No patients match the current filter.</Alert>
        ) : (
          <Grid container spacing={2}>
            {filteredPatients.map((patient) => (
              <Grid item xs={12} md={6} key={patient._id}>
                <Paper
                  className={`${styles.patientCard} ${
                    selectedPatient?._id === patient._id ? styles.selected : ''
                  }`}
                  elevation={3}
                >
                  <ListItemButton
                    onClick={() => handlePatientSelect(patient)}
                    className={styles.listButton}
                  >
                    <Box className={styles.patientInfo} data-phi="true">
                      <Typography variant="h6" className={styles.patientName}>
                        {patient.name}
                      </Typography>
                      <Typography variant="body2" className={styles.roomInfo}>
                        Room {patient.roomNumber} • {patient.age} y/o {patient.gender}
                      </Typography>

                      <Box className={styles.diagnoses}>
                        {patient.diagnosis.map((diag, idx) => (
                          <Chip
                            key={idx}
                            label={diag}
                            size="small"
                            variant="outlined"
                            sx={{ mr: 1, mt: 1 }}
                          />
                        ))}
                      </Box>

                      {patient.allergies.length > 0 && (
                        <Box className={styles.allergies}>
                          <Typography variant="caption" className={styles.allergiesLabel}>
                            Allergies:
                          </Typography>
                          {patient.allergies.map((allergy, idx) => (
                            <Chip
                              key={idx}
                              icon={<WarningIcon fontSize="small" />}
                              label={allergy}
                              size="small"
                              aria-label={`Allergy: ${allergy}`}
                              sx={{
                                mr: 1,
                                color: '#B71C1C',
                                borderColor: '#B71C1C',
                                fontWeight: 600,
                                '& .MuiChip-icon': { color: '#B71C1C' },
                              }}
                              variant="outlined"
                            />
                          ))}
                        </Box>
                      )}
                    </Box>
                  </ListItemButton>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>
    </Box>
  )
}

export default PatientListPage
