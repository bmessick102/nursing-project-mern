import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  TextField,
  Button,
  Grid,
  Select,
  MenuItem,
  Slider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
} from '@mui/material'
import type { Patient, VitalSigns } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import styles from 'styles/TabContent.module.css'

interface FlowsheetsTabProps {
  patient: Patient | null
}

const FlowsheetsTab: React.FC<FlowsheetsTabProps> = ({ patient }) => {
  const [tabValue, setTabValue] = useState(0)
  const [form, setForm] = useState({
    temp: 98.6,
    tempSource: 'Oral',
    systolic: 120,
    diastolic: 80,
    heartRate: 70,
    respiratoryRate: 16,
    spo2: 98,
    painScore: 0,
    position: 'Sitting',
  })
  const { addVitals, loading } = useChartingApi()

  if (!patient) {
    return (
      <Paper className={styles.section}>
        <Box className={styles.emptyState}>
          <Typography>No patient selected</Typography>
        </Box>
      </Paper>
    )
  }

  const handleSubmit = async () => {
    try {
      const vital: Omit<VitalSigns, '_id'> = {
        timestamp: new Date().toISOString(),
        ...form,
        documentedBy: 'Current User',
      }
      await addVitals(patient._id, vital)
      setForm({
        temp: 98.6,
        tempSource: 'Oral',
        systolic: 120,
        diastolic: 80,
        heartRate: 70,
        respiratoryRate: 16,
        spo2: 98,
        painScore: 0,
        position: 'Sitting',
      })
      setTabValue(0)
    } catch (err) {
      console.error('Failed to add vitals', err)
    }
  }

  return (
    <Paper className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Vital Signs & Assessments
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="View History" />
          <Tab label="Document New" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Temp</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>BP</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>HR</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>RR</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>SpO2</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Pain</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Position</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>By</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {[...(patient?.vitals || [])].reverse().map((vital) => (
                <TableRow key={vital._id}>
                  <TableCell>{new Date(vital.timestamp).toLocaleString()}</TableCell>
                  <TableCell>
                    {vital.temp}°F ({vital.tempSource})
                  </TableCell>
                  <TableCell>
                    {vital.systolic}/{vital.diastolic}
                  </TableCell>
                  <TableCell>{vital.heartRate}</TableCell>
                  <TableCell>{vital.respiratoryRate}</TableCell>
                  <TableCell>{vital.spo2}%</TableCell>
                  <TableCell>{vital.painScore}</TableCell>
                  <TableCell>{vital.position}</TableCell>
                  <TableCell sx={{ color: '#999' }}>{vital.documentedBy}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Temperature (°F)"
              type="number"
              value={form.temp}
              onChange={(e) => setForm({ ...form, temp: parseFloat(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select
              value={form.tempSource}
              onChange={(e) => setForm({ ...form, tempSource: e.target.value })}
              fullWidth
            >
              <MenuItem value="Oral">Oral</MenuItem>
              <MenuItem value="Axillary">Axillary</MenuItem>
              <MenuItem value="Rectal">Rectal</MenuItem>
              <MenuItem value="Tympanic">Tympanic</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Systolic BP"
              type="number"
              value={form.systolic}
              onChange={(e) => setForm({ ...form, systolic: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Diastolic BP"
              type="number"
              value={form.diastolic}
              onChange={(e) => setForm({ ...form, diastolic: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="Heart Rate (bpm)"
              type="number"
              value={form.heartRate}
              onChange={(e) => setForm({ ...form, heartRate: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Respiratory Rate"
              type="number"
              value={form.respiratoryRate}
              onChange={(e) => setForm({ ...form, respiratoryRate: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={6}>
            <TextField
              label="SpO2 (%)"
              type="number"
              value={form.spo2}
              onChange={(e) => setForm({ ...form, spo2: parseInt(e.target.value) })}
              fullWidth
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <Select
              value={form.position}
              onChange={(e) => setForm({ ...form, position: e.target.value })}
              fullWidth
            >
              <MenuItem value="Lying">Lying</MenuItem>
              <MenuItem value="Sitting">Sitting</MenuItem>
              <MenuItem value="Standing">Standing</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Pain Score: {form.painScore}
            </Typography>
            <Slider
              min={0}
              max={10}
              step={1}
              value={form.painScore}
              onChange={(_, val) => setForm({ ...form, painScore: val as number })}
              marks
            />
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading}
              sx={{ backgroundColor: '#003D82' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Save Vitals'}
            </Button>
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

export default FlowsheetsTab
