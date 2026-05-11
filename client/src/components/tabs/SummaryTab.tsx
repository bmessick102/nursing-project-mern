import React from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import type { Patient } from '@types'
import styles from 'styles/TabContent.module.css'

interface SummaryTabProps {
  patient: Patient | null
}

const SummaryTab: React.FC<SummaryTabProps> = ({ patient }) => {
  if (!patient) {
    return <Typography>No patient selected</Typography>
  }

  const latestVitals = patient.vitals?.[patient.vitals.length - 1]
  const medCount = patient.medications?.length || 0
  const labCount = patient.labs?.length || 0
  const noteCount = patient.nursingNotes?.length || 0

  return (
    <Box>
      <Box className={styles.statsBand}>
        <Box className={styles.statsHeader}>
          <span className={styles.statsEyebrow}>By the Numbers</span>
          <Typography variant="h5" className={styles.statsTitle}>
            Today&rsquo;s Care Snapshot
          </Typography>
        </Box>
        <Box className={styles.statsGrid}>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>
              {latestVitals?.heartRate ?? '—'}
            </span>
            <span className={styles.statLabel}>Heart Rate (bpm)</span>
          </Box>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>
              {latestVitals
                ? `${latestVitals.systolic}/${latestVitals.diastolic}`
                : '—'}
            </span>
            <span className={styles.statLabel}>Blood Pressure</span>
          </Box>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>
              {latestVitals?.spo2 ?? '—'}
              <span className={styles.statUnit}>%</span>
            </span>
            <span className={styles.statLabel}>SpO₂</span>
          </Box>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>{medCount}</span>
            <span className={styles.statLabel}>Active Meds</span>
          </Box>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>{labCount}</span>
            <span className={styles.statLabel}>Lab Results</span>
          </Box>
          <Box className={styles.statCard}>
            <span className={styles.statValue}>{noteCount}</span>
            <span className={styles.statLabel}>Nursing Notes</span>
          </Box>
        </Box>
      </Box>

      <Grid container spacing={3}>
        {/* Patient Demographics */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Patient Information
            </Typography>
            <Box className={styles.infoGrid}>
              <div className={styles.infoRow}>
                <span className={styles.label}>Name:</span>
                <span className={styles.value}>{patient.name}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Age:</span>
                <span className={styles.value}>{patient.age} years</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Gender:</span>
                <span className={styles.value}>{patient.gender}</span>
              </div>
              <div className={styles.infoRow}>
                <span className={styles.label}>Room Number:</span>
                <span className={styles.value}>{patient.roomNumber}</span>
              </div>
            </Box>
          </Paper>
        </Grid>

        {/* Allergies */}
        <Grid item xs={12} md={6}>
          <Paper className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Allergies
            </Typography>
            <Box className={styles.chipContainer}>
              {patient.allergies.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No known allergies
                </Typography>
              ) : (
                patient.allergies.map((allergy, idx) => (
                  <Chip
                    key={idx}
                    label={allergy}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1, color: '#B71C1C', borderColor: '#B71C1C', fontWeight: 600 }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        {/* Diagnoses */}
        <Grid item xs={12}>
          <Paper className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Active Diagnoses
            </Typography>
            <Box className={styles.chipContainer}>
              {patient.diagnosis.map((diag, idx) => (
                <Chip
                  key={idx}
                  label={diag}
                  variant="outlined"
                  sx={{ mr: 1, mb: 1, color: '#003D82', borderColor: '#003D82', fontWeight: 600 }}
                />
              ))}
            </Box>
          </Paper>
        </Grid>

        {/* Current Medications */}
        <Grid item xs={12}>
          <Paper className={styles.section}>
            <Typography variant="h6" className={styles.sectionTitle}>
              Current Medications
            </Typography>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Medication</TableCell>
                    <TableCell>Dose</TableCell>
                    <TableCell>Frequency</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {patient.medications.map((med, idx) => (
                    <TableRow
                      key={idx}
                      sx={{
                        '&:nth-of-type(odd)': { backgroundColor: '#F8F9FA' },
                        '&:hover': { backgroundColor: '#FFFBF0' },
                      }}
                    >
                      <TableCell sx={{ fontWeight: 500 }}>{med.name}</TableCell>
                      <TableCell>{med.dose}</TableCell>
                      <TableCell>{med.frequency}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  )
}

export default SummaryTab
