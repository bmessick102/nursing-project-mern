import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Select,
  MenuItem,
  Stack,
  CircularProgress,
} from '@mui/material'
import type { Patient, Encounter } from '@types'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import EditMenu from 'components/edit/EditMenu'
import MarkInErrorDialog from 'components/edit/MarkInErrorDialog'
import ModificationHistory from 'components/edit/ModificationHistory'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import TabHeader from 'components/common/TabHeader'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

interface ChartReviewTabProps {
  patient: Patient | null
}

const ENCOUNTER_TYPES = [
  'Admission',
  'Office Visit',
  'Progress Note',
  'Consult',
  'Discharge',
  'Emergency',
  'Procedure',
  'Telehealth',
]

const SPECIALTIES = [
  'Internal Medicine',
  'Cardiology',
  'Pulmonology',
  'Neurology',
  'Endocrinology',
  'Nephrology',
  'Orthopedics',
  'Surgery',
  'Emergency Medicine',
  'Psychiatry',
  'Family Medicine',
]

const blankEncounter = () => ({
  date: new Date().toISOString().slice(0, 16),
  type: 'Progress Note',
  provider: '',
  specialty: 'Internal Medicine',
  diagnosis: '',
  subjective: '',
  objective: '',
  assessment: '',
  plan: '',
})

const ChartReviewTab: React.FC<ChartReviewTabProps> = ({ patient }) => {
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const { addEncounter, editResource, markResourceInError, loading } = useChartingApi()
  const [selectedEncounter, setSelectedEncounter] = useState<Encounter | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(blankEncounter())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<Encounter | null>(null)
  const [historyFor, setHistoryFor] = useState<Encounter | null>(null)

  const encounters = patient?.encounters || []

  const handleOpen = () => {
    setForm(blankEncounter())
    setEditingId(null)
    setEditReason('')
    setDialogOpen(true)
  }

  const startEdit = (enc: Encounter) => {
    setForm({
      date: new Date(enc.date).toISOString().slice(0, 16),
      type: enc.type,
      provider: enc.provider,
      specialty: enc.specialty,
      diagnosis: enc.diagnosis,
      subjective: enc.subjective || '',
      objective: enc.objective || '',
      assessment: enc.assessment || '',
      plan: enc.plan || '',
    })
    setEditingId(enc._id)
    setEditReason('')
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!patient) return
    try {
      const payload = {
        date: new Date(form.date).toISOString(),
        type: form.type,
        provider: form.provider.trim() || 'Unknown Provider',
        specialty: form.specialty,
        diagnosis: form.diagnosis.trim(),
        subjective: form.subjective.trim() || undefined,
        objective: form.objective.trim() || undefined,
        assessment: form.assessment.trim() || undefined,
        plan: form.plan.trim() || undefined,
      }
      if (editingId) {
        const updated = await editResource(
          patient._id,
          'encounters',
          editingId,
          payload,
          editReason || undefined,
        )
        setSelectedPatient(updated)
        const updatedEnc = updated.encounters.find((e) => e._id === editingId) || null
        setSelectedEncounter(updatedEnc)
      } else {
        const updated = await addEncounter(patient._id, payload as Omit<Encounter, '_id'>)
        setSelectedPatient(updated)
        const newEnc = updated.encounters[updated.encounters.length - 1]
        if (newEnc) setSelectedEncounter(newEnc)
      }
      setDialogOpen(false)
      setEditingId(null)
      setEditReason('')
    } catch (err) {
      console.error('Failed to save encounter', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor || !patient) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'encounters',
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

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const encounter =
    (selectedEncounter && encounters.find((e) => e._id === selectedEncounter._id)) || encounters[0]

  return (
    <>
      <TabHeader
        title="Chart Review / Encounters"
        actionLabel="Add Encounter"
        onAction={handleOpen}
      />

      {encounters.length === 0 ? (
        <EmptyState
          message="No encounters documented yet."
          actionHint='Click "Add Encounter" to document the first one.'
        />
      ) : (
        <Grid container spacing={2} className={styles.tabContainer}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Encounters
              </Typography>
              {Object.entries(groupedEncounters).map(([group, groupEnc]) => (
                <Box key={group} sx={{ mb: 2 }}>
                  <Typography variant="caption" sx={{ color: '#6B6B6B', fontWeight: 600 }}>
                    {group}
                  </Typography>
                  {groupEnc.map((enc) => (
                    <Card
                      key={enc._id}
                      sx={{
                        mt: 1,
                        mb: 1,
                        backgroundColor:
                          selectedEncounter?._id === enc._id ? '#FFFBF0' : '#fff',
                        borderLeft:
                          selectedEncounter?._id === enc._id
                            ? '4px solid #FFB81C'
                            : '4px solid transparent',
                        ...inErrorRowSx(enc.markedInError),
                      }}
                    >
                      <CardActionArea
                        onClick={() => setSelectedEncounter(enc)}
                        sx={{ p: 1.5 }}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography
                            variant="body2"
                            sx={{ fontWeight: 600, color: '#003D82' }}
                          >
                            {enc.type}
                          </Typography>
                          {enc.markedInError && <InErrorBanner entry={enc} compact />}
                        </Stack>
                        <Typography variant="caption" sx={{ color: '#666' }}>
                          {new Date(enc.date).toLocaleDateString()} • {enc.provider}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'block', mt: 0.5 }}>
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
              <InErrorBanner entry={encounter} />
              <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ mb: 2 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  {encounter.type}
                </Typography>
                <EditMenu
                  entry={encounter}
                  onEdit={() => startEdit(encounter)}
                  onMarkInError={() => setMarkInErrorFor(encounter)}
                  onViewHistory={() => setHistoryFor(encounter)}
                />
              </Stack>

              <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee', ...inErrorRowSx(encounter.markedInError) }}>
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
                {encounter.lastModifiedAt && (
                  <Typography variant="caption" sx={{ color: '#6B6B6B', mt: 0.5, fontStyle: 'italic', display: 'block' }}>
                    Modified by {encounter.lastModifiedBy} at {new Date(encounter.lastModifiedAt).toLocaleString()}
                  </Typography>
                )}
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
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="md" fullWidth>
        <DialogTitle>{editingId ? 'Edit Encounter' : 'Add Encounter'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date / Time"
                type="datetime-local"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Encounter Type
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.type}
                aria-label="Encounter Type"
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {ENCOUNTER_TYPES.map((t) => (
                  <MenuItem key={t} value={t}>
                    {t}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Provider"
                placeholder="Dr. Last Name"
                fullWidth
                size="small"
                value={form.provider}
                onChange={(e) => setForm({ ...form, provider: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Specialty
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.specialty}
                aria-label="Specialty"
                onChange={(e) => setForm({ ...form, specialty: e.target.value })}
              >
                {SPECIALTIES.map((s) => (
                  <MenuItem key={s} value={s}>
                    {s}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Diagnosis"
                placeholder="Working / admitting diagnosis"
                fullWidth
                size="small"
                value={form.diagnosis}
                onChange={(e) => setForm({ ...form, diagnosis: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Subjective (S)"
                placeholder="What the patient reports — symptoms, complaints, history"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.subjective}
                onChange={(e) => setForm({ ...form, subjective: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Objective (O)"
                placeholder="Vital signs, physical exam, lab values"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.objective}
                onChange={(e) => setForm({ ...form, objective: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Assessment (A)"
                placeholder="Clinical assessment / differential"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.assessment}
                onChange={(e) => setForm({ ...form, assessment: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Plan (P)"
                placeholder="Treatment plan, orders, follow-up"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.plan}
                onChange={(e) => setForm({ ...form, plan: e.target.value })}
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
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleSubmit}
            variant="contained"
            disabled={loading || !form.diagnosis.trim()}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : editingId ? 'Save Changes' : 'Add Encounter'}
          </Button>
        </DialogActions>
      </Dialog>

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="encounter"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="encounter"
      />
    </>
  )
}

export default ChartReviewTab
