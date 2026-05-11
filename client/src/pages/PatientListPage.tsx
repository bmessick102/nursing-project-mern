import React, { useEffect, useState } from 'react'
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
} from '@mui/material'
import type { Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useAppStore } from 'store/useAppStore'
import UtilityBar from 'components/UtilityBar'
import Footer from 'components/Footer'
import styles from 'styles/PatientListPage.module.css'

interface PatientListPageProps {
  onPatientSelected: () => void
  onBack: () => void
}

const PatientListPage: React.FC<PatientListPageProps> = ({
  onPatientSelected,
  onBack,
}) => {
  const { fetchPatientsByCourse, loading, error } = useChartingApi()
  const [patients, setPatients] = useState<Patient[]>([])
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
    onPatientSelected()
  }

  return (
    <Box className={styles.patientContainer}>
      <UtilityBar />
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
              onClick={onBack}
              className={styles.backButton}
            >
              Back to Courses
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="md">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

        {loading ? (
          <Box className={styles.loadingContainer}>
            <CircularProgress />
          </Box>
        ) : patients.length === 0 ? (
          <Alert severity="info">No patients available for this course</Alert>
        ) : (
          <Grid container spacing={2}>
            {patients.map((patient) => (
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
                    <Box className={styles.patientInfo}>
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
                              label={allergy}
                              size="small"
                              sx={{
                                mr: 1,
                                color: '#B71C1C',
                                borderColor: '#B71C1C',
                                fontWeight: 600,
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
      <Footer />
    </Box>
  )
}

export default PatientListPage
