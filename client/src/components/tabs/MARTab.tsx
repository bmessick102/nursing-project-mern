import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
  Stack,
  Grid,
  Autocomplete,
} from '@mui/material'
import type { MAREntry } from '@types'
import { MEDICATIONS, COMMON_DOSES } from 'data/clinicalReference'
import SearchableSelect from 'components/common/SearchableSelect'
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


interface SignoffState {
  entryId: string | null
  scheduledTime: string | null
}

const ROUTES = [
  'Oral',
  'IV',
  'IV Push',
  'IM',
  'Subcutaneous',
  'Topical',
  'Sublingual',
  'Rectal',
  'Inhalation',
  'Ophthalmic',
  'Otic',
  'Transdermal',
  'Nasal',
  'Gastric tube',
]

const FREQUENCIES = [
  'Once daily',
  'Twice daily (BID)',
  'Three times daily (TID)',
  'Four times daily (QID)',
  'Every 4 hours',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'At bedtime (HS)',
  'Before meals (AC)',
  'After meals (PC)',
  'As needed (PRN)',
  'Once',
  'STAT',
]

const TIME_OPTIONS = ['0600', '0800', '1000', '1200', '1400', '1600', '1800', '2000', '2200', '0200']

// Sorted by drug class so the Autocomplete's grouped headers stay contiguous.
const MED_OPTIONS = [...MEDICATIONS].sort(
  (a, b) => a.drugClass.localeCompare(b.drugClass) || a.name.localeCompare(b.name),
)

const blankForm = () => ({
  medicationName: '',
  dose: '',
  route: 'Oral',
  frequency: 'Twice daily (BID)',
  scheduledTimes: ['0800', '2000'] as string[],
})

const MARTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const [signoffDialog, setSignoffDialog] = useState<SignoffState>({
    entryId: null,
    scheduledTime: null,
  })
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [form, setForm] = useState(blankForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<MAREntry | null>(null)
  const [historyFor, setHistoryFor] = useState<MAREntry | null>(null)
  const {
    signMAR,
    addMAREntry,
    editResource,
    markResourceInError,
    loading,
  } = useChartingApi()
  const marEntries = patient?.marEntries || []

  const handleSignoff = async () => {
    if (!signoffDialog.entryId || !signoffDialog.scheduledTime || !patient?._id) return

    try {
      const updated = await signMAR(patient._id, {
        entryId: signoffDialog.entryId,
        scheduledTime: signoffDialog.scheduledTime,
        givenBy: username,
      })
      setSelectedPatient(updated)
      setSignoffDialog({ entryId: null, scheduledTime: null })
    } catch (err) {
      console.error('Failed to sign MAR', err)
    }
  }

  const handleAddOpen = () => {
    setForm(blankForm())
    setEditingId(null)
    setEditReason('')
    setAddDialogOpen(true)
  }

  const startEdit = (mar: MAREntry) => {
    setForm({
      medicationName: mar.medicationName,
      dose: mar.dose,
      route: mar.route,
      frequency: mar.frequency,
      scheduledTimes: mar.scheduledTimes,
    })
    setEditingId(mar._id)
    setEditReason('')
    setAddDialogOpen(true)
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor || !patient) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'mar-entries',
        markInErrorFor._id,
        reason,
        username,
      )
      setSelectedPatient(updated)
      setMarkInErrorFor(null)
    } catch (err) {
      console.error('Failed to mark MAR entry in error', err)
    }
  }

  const toggleTime = (time: string) => {
    const set = new Set(form.scheduledTimes)
    if (set.has(time)) set.delete(time)
    else set.add(time)
    setForm({ ...form, scheduledTimes: Array.from(set).sort() })
  }

  const handleAddSubmit = async () => {
    if (!patient || !form.medicationName.trim() || !form.dose.trim()) return
    try {
      const payload = {
        medicationName: form.medicationName.trim(),
        dose: form.dose.trim(),
        route: form.route,
        frequency: form.frequency,
        scheduledTimes: form.scheduledTimes,
      }
      if (editingId) {
        const updated = await editResource(
          patient._id,
          'mar-entries',
          editingId,
          payload,
          editReason || undefined,
        )
        setSelectedPatient(updated)
      } else {
        const updated = await addMAREntry(
          patient._id,
          payload as Omit<MAREntry, '_id' | 'administrations'>,
        )
        setSelectedPatient(updated)
      }
      setAddDialogOpen(false)
      setEditingId(null)
      setEditReason('')
    } catch (err) {
      console.error('Failed to save MAR entry', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'given':
        return '#4CAF50'
      case 'due':
        return '#6B6B6B'
      case 'overdue':
        return '#FF9800'
      case 'held':
        return '#d32f2f'
      default:
        return '#6B6B6B'
    }
  }

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  return (
    <Box data-phi="true">
      <TabHeader
        title="Medication Administration Record"
        actionLabel="Add Medication"
        onAction={handleAddOpen}
      />

      <Typography
        variant="caption"
        sx={{
          display: { xs: 'block', md: 'none' },
          color: '#595959',
          mb: 1,
          fontStyle: 'italic',
        }}
      >
        Tip: scroll horizontally to see all administration times →
      </Typography>
      <Paper className={styles.section} sx={{ overflow: 'auto' }}>
        {marEntries.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography>No medications scheduled.</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6B6B6B' }}>
              Click "Add Medication" to start the MAR.
            </Typography>
          </Box>
        ) : (
          <TableContainer sx={{ overflowX: 'auto' }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Medication</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Dose</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Route</TableCell>
                  <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Frequency</TableCell>
                  {['0600', '1200', '1800', '2200'].map((time) => (
                    <TableCell
                      key={time}
                      sx={{ fontWeight: 600, textAlign: 'center', minWidth: 80 }}
                    >
                      {time}
                    </TableCell>
                  ))}
                  <TableCell sx={{ fontWeight: 600, minWidth: 50 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {marEntries.map((mar) => (
                  <TableRow key={mar._id} sx={inErrorRowSx(mar.markedInError)}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {mar.medicationName}
                        {mar.markedInError && <InErrorBanner entry={mar} compact />}
                        {mar.lastModifiedAt && !mar.markedInError && (
                          <Typography variant="caption" sx={{ color: '#6B6B6B', fontStyle: 'italic' }}>
                            (edited)
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell>{mar.dose}</TableCell>
                    <TableCell>{mar.route}</TableCell>
                    <TableCell>{mar.frequency}</TableCell>
                    {['0600', '1200', '1800', '2200'].map((time) => {
                      const admin = mar.administrations.find((a) => a.scheduledTime === time)
                      return (
                        <TableCell key={time} sx={{ textAlign: 'center' }}>
                          {admin ? (
                            <Chip
                              label={
                                admin.status === 'given'
                                  ? '✓'
                                  : admin.status.substring(0, 2).toUpperCase()
                              }
                              size="small"
                              sx={{
                                backgroundColor: getStatusColor(admin.status),
                                color: 'white',
                                fontWeight: 600,
                                cursor:
                                  admin.status !== 'given' && !mar.markedInError ? 'pointer' : 'default',
                              }}
                              onClick={() => {
                                if (admin.status !== 'given' && !mar.markedInError) {
                                  setSignoffDialog({
                                    entryId: mar._id,
                                    scheduledTime: time,
                                  })
                                }
                              }}
                            />
                          ) : null}
                        </TableCell>
                      )
                    })}
                    <TableCell>
                      <EditMenu
                        entry={mar}
                        onEdit={() => startEdit(mar)}
                        onMarkInError={() => setMarkInErrorFor(mar)}
                        onViewHistory={() => setHistoryFor(mar)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Dialog
        open={signoffDialog.entryId !== null}
        onClose={() => setSignoffDialog({ entryId: null, scheduledTime: null })}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Mark Medication as Given</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Are you sure you want to mark this medication as administered?
          </Typography>
          <TextField label="Given By" value={username} disabled fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignoffDialog({ entryId: null, scheduledTime: null })}>
            Cancel
          </Button>
          <Button onClick={handleSignoff} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={20} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addDialogOpen} onClose={() => setAddDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Medication' : 'Add Medication to MAR'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <Autocomplete
                freeSolo
                options={MED_OPTIONS}
                groupBy={(o) => (typeof o === 'string' ? '' : o.drugClass)}
                getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
                filterOptions={(opts, state) => {
                  const q = state.inputValue.trim().toLowerCase()
                  if (!q) return opts
                  return opts.filter(
                    (o) =>
                      o.name.toLowerCase().includes(q) ||
                      (o.aliases || []).some((a) => a.toLowerCase().includes(q)),
                  )
                }}
                inputValue={form.medicationName}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return
                  setForm((prev) => ({ ...prev, medicationName: v }))
                }}
                onChange={(_, v) => {
                  if (v && typeof v !== 'string') {
                    setForm((prev) => ({
                      ...prev,
                      medicationName: v.name,
                      dose: prev.dose.trim() ? prev.dose : v.defaultDose,
                      route: v.defaultRoute,
                      frequency: v.defaultFrequency,
                    }))
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Medication Name"
                    placeholder="Search medications (autofills dose, route, frequency)…"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SearchableSelect
                label="Dose"
                freeSolo
                placeholder="e.g., 500 mg, 10 mg, 1 tablet"
                value={form.dose}
                onChange={(v) => setForm((prev) => ({ ...prev, dose: v }))}
                options={
                  form.dose && !COMMON_DOSES.includes(form.dose)
                    ? [form.dose, ...COMMON_DOSES]
                    : COMMON_DOSES
                }
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <SearchableSelect
                label="Route"
                value={form.route}
                onChange={(v) => setForm((prev) => ({ ...prev, route: v }))}
                options={ROUTES}
              />
            </Grid>
            <Grid item xs={12}>
              <SearchableSelect
                label="Frequency"
                value={form.frequency}
                onChange={(v) => setForm((prev) => ({ ...prev, frequency: v }))}
                options={FREQUENCIES}
              />
            </Grid>
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600, display: 'block', mb: 1 }}>
                Scheduled Times (military, 24h)
              </Typography>
              <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                {TIME_OPTIONS.map((t) => {
                  const selected = form.scheduledTimes.includes(t)
                  return (
                    <Chip
                      key={t}
                      label={t}
                      onClick={() => toggleTime(t)}
                      color={selected ? 'primary' : 'default'}
                      variant={selected ? 'filled' : 'outlined'}
                      sx={{ cursor: 'pointer' }}
                    />
                  )
                })}
              </Stack>
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
          <Button onClick={() => setAddDialogOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            disabled={
              loading ||
              !form.medicationName.trim() ||
              !form.dose.trim() ||
              form.scheduledTimes.length === 0
            }
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : editingId ? 'Save Changes' : 'Save Medication'}
          </Button>
        </DialogActions>
      </Dialog>

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="medication order"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="medication order"
      />
    </Box>
  )
}

export default MARTab
