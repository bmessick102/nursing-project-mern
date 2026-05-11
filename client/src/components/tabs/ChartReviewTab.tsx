import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
} from '@mui/material'
import type { Patient, Encounter } from '@types'
import styles from 'styles/TabContent.module.css'

interface ChartReviewTabProps {
  patient: Patient | null
}

const ChartReviewTab: React.FC<ChartReviewTabProps> = ({ patient }) => {
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null)

  const encounters = patient?.encounters || []

  if (!patient || encounters.length === 0) {
    return (
      <Paper className={styles.section}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Chart Review / Encounters
        </Typography>
        <Box className={styles.emptyState}>
          <Typography>No encounters available for this patient</Typography>
        </Box>
      </Paper>
    )
  }

  const getTimeGroup = (date: string) => {
    const encDate = new Date(date)
    const now = new Date()
    const diffMs = now.getTime() - encDate.getTime()
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays} Days Ago`
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} Weeks Ago`
    if (diffDays < 365) return `${Math.floor(diffDays / 30)} Months Ago`
    return `${Math.floor(diffDays / 365)} Years Ago`
  }

  const groupedEncounters = encounters.reduce(
    (acc, enc) => {
      const group = getTimeGroup(enc.date)
      if (!acc[group]) acc[group] = []
      acc[group].push(enc)
      return acc
    },
    {} as Record<string, Encounter[]>,
  )

  const encounter = selectedEncounter || encounters[0]

  return (
    <Grid container spacing={2} className={styles.tabContainer}>
      <Grid item xs={12} md={5}>
        <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Encounters
          </Typography>
          {Object.entries(groupedEncounters).map(([group, encounters]) => (
            <Box key={group} sx={{ mb: 2 }}>
              <Typography variant="caption" sx={{ color: '#999', fontWeight: 600 }}>
                {group}
              </Typography>
              {encounters.map((enc) => (
                <Card
                  key={enc._id}
                  sx={{
                    mt: 1,
                    mb: 1,
                    backgroundColor: selectedEncounter?._id === enc._id ? '#FFFBF0' : '#fff',
                    borderLeft: selectedEncounter?._id === enc._id ? '4px solid #FFB81C' : '4px solid transparent',
                  }}
                >
                  <CardActionArea onClick={() => setSelectedEncounter(enc)} sx={{ p: 1.5 }}>
                    <Typography variant="body2" sx={{ fontWeight: 600, color: '#003D82' }}>
                      {enc.type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {new Date(enc.date).toLocaleDateString()} • {enc.provider}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#999', display: 'block', mt: 0.5 }}>
                      {enc.specialty}
                    </Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Box>
          ))}
        </Paper>
      </Grid>

      <Grid item xs={12} md={7}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            {encounter.type}
          </Typography>

          <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
            <Typography variant="body2" sx={{ color: '#666' }}>
              <strong>Date:</strong> {new Date(encounter.date).toLocaleString()}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              <strong>Provider:</strong> {encounter.provider}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              <strong>Specialty:</strong> {encounter.specialty}
            </Typography>
            <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
              <strong>Diagnosis:</strong> {encounter.diagnosis}
            </Typography>
          </Box>

          <Box sx={{ mt: 3 }}>
            {encounter.subjective && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#003D82', mb: 1 }}>
                  Subjective
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                  {encounter.subjective}
                </Typography>
              </Box>
            )}

            {encounter.objective && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#003D82', mb: 1 }}>
                  Objective
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                  {encounter.objective}
                </Typography>
              </Box>
            )}

            {encounter.assessment && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#003D82', mb: 1 }}>
                  Assessment
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                  {encounter.assessment}
                </Typography>
              </Box>
            )}

            {encounter.plan && (
              <Box>
                <Typography variant="h6" sx={{ fontSize: '1rem', fontWeight: 600, color: '#003D82', mb: 1 }}>
                  Plan
                </Typography>
                <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.6 }}>
                  {encounter.plan}
                </Typography>
              </Box>
            )}
          </Box>
        </Paper>
      </Grid>
    </Grid>
  )
}

export default ChartReviewTab
