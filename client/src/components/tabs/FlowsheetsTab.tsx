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
  Stack,
} from '@mui/material'
import type { Patient, VitalSigns } from '@types'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import {
  vitalCellSx,
  severityPrefix,
  vitalCellAriaLabel,
  getVitalSeverity,
} from 'utils/vitalRanges'
import EditMenu from 'components/edit/EditMenu'
import MarkInErrorDialog from 'components/edit/MarkInErrorDialog'
import ModificationHistory from 'components/edit/ModificationHistory'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import TabHeader from 'components/common/TabHeader'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

interface FlowsheetsTabProps {
  patient: Patient | null
}

const blankForm = () => ({
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

const FlowsheetsTab: React.FC<FlowsheetsTabProps> = ({ patient }) => {
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const [tabValue, setTabValue] = useState(0)
  const [form, setForm] = useState(blankForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')

  const [markInErrorFor, setMarkInErrorFor] = useState<VitalSigns | null>(null)
  const [historyFor, setHistoryFor] = useState<VitalSigns | null>(null)

  const { addVitals, editResource, markResourceInError, loading } = useChartingApi()

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const startEdit = (vital: VitalSigns) => {
    setEditingId(vital._id)
    setForm({
      temp: vital.temp,
      tempSource: vital.tempSource,
      systolic: vital.systolic,
      diastolic: vital.diastolic,
      heartRate: vital.heartRate,
      respiratoryRate: vital.respiratoryRate,
      spo2: vital.spo2,
      painScore: vital.painScore,
      position: vital.position,
    })
    setEditReason('')
    setTabValue(1)
  }

  const handleSubmit = async () => {
    try {
      if (editingId) {
        const updated = await editResource(
          patient._id,
          'vitals',
          editingId,
          { ...form },
          editReason || undefined,
        )
        setSelectedPatient(updated)
      } else {
        const vital: Omit<VitalSigns, '_id'> = {
          timestamp: new Date().toISOString(),
          ...form,
          documentedBy: username,
        }
        const updated = await addVitals(patient._id, vital)
        setSelectedPatient(updated)
      }
      setForm(blankForm())
      setEditingId(null)
      setEditReason('')
      setTabValue(0)
    } catch (err) {
      console.error('Failed to save vitals', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'vitals',
        markInErrorFor._id,
        reason,
        username,
      )
      setSelectedPatient(updated)
      setMarkInErrorFor(null)
    } catch (err) {
      console.error('Failed to mark in error', err)
    }
  }

  return (
    <>
      <TabHeader
        title="Vital Signs & Flowsheets"
        actionLabel="Add Vitals"
        onAction={() => {
          setEditingId(null)
          setForm(blankForm())
          setEditReason('')
          setTabValue(1)
        }}
      />

      <Paper className={styles.section}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
          <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
            <Tab label="View History" />
            <Tab label={editingId ? 'Edit Vitals' : 'Document New'} />
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
                  <TableCell sx={{ fontWeight: 600 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {[...(patient.vitals || [])].reverse().map((vital) => (
                  <TableRow key={vital._id} sx={inErrorRowSx(vital.markedInError)}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {new Date(vital.timestamp).toLocaleString()}
                        {vital.markedInError && <InErrorBanner entry={vital} compact />}
                        {vital.lastModifiedAt && !vital.markedInError && (
                          <Typography variant="caption" sx={{ color: '#6B6B6B', fontStyle: 'italic' }}>
                            (edited)
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell
                      sx={vitalCellSx('temp', vital.temp)}
                      aria-label={vitalCellAriaLabel('temp', vital.temp, '°F')}
                    >
                      {severityPrefix(getVitalSeverity('temp', vital.temp))}
                      {vital.temp}°F ({vital.tempSource})
                    </TableCell>
                    <TableCell
                      sx={{
                        ...vitalCellSx('systolic', vital.systolic),
                        ...vitalCellSx('diastolic', vital.diastolic),
                      }}
                      aria-label={`Blood pressure ${vital.systolic} over ${vital.diastolic}, ${
                        getVitalSeverity('systolic', vital.systolic) !== 'normal' ||
                        getVitalSeverity('diastolic', vital.diastolic) !== 'normal'
                          ? 'abnormal'
                          : 'normal'
                      }`}
                    >
                      {(getVitalSeverity('systolic', vital.systolic) !== 'normal' ||
                        getVitalSeverity('diastolic', vital.diastolic) !== 'normal') &&
                        '⚠ '}
                      {vital.systolic}/{vital.diastolic}
                    </TableCell>
                    <TableCell
                      sx={vitalCellSx('heartRate', vital.heartRate)}
                      aria-label={vitalCellAriaLabel('heartRate', vital.heartRate, ' bpm')}
                    >
                      {severityPrefix(getVitalSeverity('heartRate', vital.heartRate))}
                      {vital.heartRate}
                    </TableCell>
                    <TableCell
                      sx={vitalCellSx('respiratoryRate', vital.respiratoryRate)}
                      aria-label={vitalCellAriaLabel(
                        'respiratoryRate',
                        vital.respiratoryRate,
                        ' per minute',
                      )}
                    >
                      {severityPrefix(getVitalSeverity('respiratoryRate', vital.respiratoryRate))}
                      {vital.respiratoryRate}
                    </TableCell>
                    <TableCell
                      sx={vitalCellSx('spo2', vital.spo2)}
                      aria-label={vitalCellAriaLabel('spo2', vital.spo2, '%')}
                    >
                      {severityPrefix(getVitalSeverity('spo2', vital.spo2))}
                      {vital.spo2}%
                    </TableCell>
                    <TableCell
                      sx={vitalCellSx('painScore', vital.painScore)}
                      aria-label={vitalCellAriaLabel('painScore', vital.painScore, ' out of 10')}
                    >
                      {severityPrefix(getVitalSeverity('painScore', vital.painScore))}
                      {vital.painScore}
                    </TableCell>
                    <TableCell>{vital.position}</TableCell>
                    <TableCell sx={{ color: '#6B6B6B' }}>{vital.documentedBy}</TableCell>
                    <TableCell>
                      <EditMenu
                        entry={vital}
                        onEdit={() => startEdit(vital)}
                        onMarkInError={() => setMarkInErrorFor(vital)}
                        onViewHistory={() => setHistoryFor(vital)}
                      />
                    </TableCell>
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
                aria-label="Pain score, 0 to 10"
                aria-valuetext={`${form.painScore} out of 10`}
              />
            </Grid>

            {editingId && (
              <Grid item xs={12}>
                <TextField
                  label="Reason for edit (optional)"
                  fullWidth
                  size="small"
                  value={editReason}
                  onChange={(e) => setEditReason(e.target.value)}
                />
              </Grid>
            )}

            <Grid item xs={12}>
              <Stack direction="row" spacing={1}>
                <Button
                  variant="contained"
                  onClick={handleSubmit}
                  disabled={loading}
                  sx={{ backgroundColor: '#003D82' }}
                >
                  {loading ? <CircularProgress size={20} /> : editingId ? 'Save Changes' : 'Save Vitals'}
                </Button>
                {editingId && (
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setEditingId(null)
                      setForm(blankForm())
                      setEditReason('')
                      setTabValue(0)
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </Stack>
            </Grid>
          </Grid>
        )}
      </Paper>

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="vital signs entry"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="vital signs entry"
      />
    </>
  )
}

export default FlowsheetsTab
