import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemButton,
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
import type { Patient, LabResult } from '@types'
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

interface ResultsTabProps {
  patient: Patient | null
}

const CATEGORIES = [
  'CHEMISTRY',
  'HEMATOLOGY',
  'COAGULATION',
  'URINALYSIS',
  'MICROBIOLOGY',
  'BLOOD GAS',
  'CARDIAC MARKERS',
  'TOXICOLOGY',
  'ENDOCRINE',
]

const blankLab = () => ({
  category: 'CHEMISTRY',
  name: '',
  value: '',
  unit: '',
  referenceRange: '',
  date: new Date().toISOString().slice(0, 16),
  flag: '' as '' | 'H' | 'L' | 'C',
})

const ResultsTab: React.FC<ResultsTabProps> = ({ patient }) => {
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const { addLab, editResource, markResourceInError, loading } = useChartingApi()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(blankLab())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<LabResult | null>(null)
  const [historyFor, setHistoryFor] = useState<LabResult | null>(null)

  const labs = patient?.labs || []

  const handleOpen = () => {
    setForm({ ...blankLab(), category: selectedCategory || 'CHEMISTRY' })
    setEditingId(null)
    setEditReason('')
    setDialogOpen(true)
  }

  const startEdit = (lab: LabResult) => {
    setForm({
      category: lab.category,
      name: lab.name,
      value: lab.value,
      unit: lab.unit,
      referenceRange: lab.referenceRange,
      date: new Date(lab.date).toISOString().slice(0, 16),
      flag: (lab.flag || '') as '' | 'H' | 'L' | 'C',
    })
    setEditingId(lab._id)
    setEditReason('')
    setDialogOpen(true)
  }

  const handleSubmit = async () => {
    if (!patient) return
    try {
      const payload = {
        category: form.category,
        name: form.name.trim(),
        value: form.value.trim(),
        unit: form.unit.trim(),
        referenceRange: form.referenceRange.trim(),
        date: new Date(form.date).toISOString(),
        flag: form.flag === '' ? undefined : form.flag,
      }
      if (editingId) {
        const updated = await editResource(
          patient._id,
          'labs',
          editingId,
          payload,
          editReason || undefined,
        )
        setSelectedPatient(updated)
      } else {
        const updated = await addLab(patient._id, payload as Omit<LabResult, '_id'>)
        setSelectedPatient(updated)
      }
      setSelectedCategory(form.category)
      setDialogOpen(false)
      setEditingId(null)
      setEditReason('')
    } catch (err) {
      console.error('Failed to save lab', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor || !patient) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'labs',
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

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'H':
        return '#FF9800'
      case 'L':
        return '#003D82'
      case 'C':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const categories =
    labs.length > 0
      ? Array.from(new Set(labs.map((lab) => lab.category)))
      : []
  const active = selectedCategory || categories[0] || 'CHEMISTRY'
  const filtered = labs.filter((lab) => lab.category === active)

  return (
    <>
      <TabHeader title="Results" actionLabel="Add Lab Result" onAction={handleOpen} />

      {labs.length === 0 ? (
        <EmptyState
          message="No lab results documented yet."
          actionHint='Click "Add Lab Result" to add one.'
        />
      ) : (
        <Grid container spacing={2} className={styles.tabContainer}>
          <Grid item xs={12} md={3}>
            <Paper sx={{ p: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Categories
              </Typography>
              <List sx={{ p: 0 }}>
                {categories.map((cat) => (
                  <ListItem key={cat} disablePadding>
                    <ListItemButton
                      selected={cat === active}
                      onClick={() => setSelectedCategory(cat)}
                      sx={{
                        borderLeft:
                          cat === active ? '4px solid #FFB81C' : '4px solid transparent',
                        backgroundColor: cat === active ? '#FFFBF0' : 'transparent',
                        fontWeight: cat === active ? 700 : 400,
                      }}
                    >
                      <Typography
                        variant="body2"
                        sx={{
                          color: cat === active ? '#003D82' : '#1F2937',
                          fontWeight: cat === active ? 700 : 400,
                        }}
                      >
                        {cat}
                      </Typography>
                    </ListItemButton>
                  </ListItem>
                ))}
              </List>
            </Paper>
          </Grid>

          <Grid item xs={12} md={9}>
            <TableContainer component={Paper}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Reference Range</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Flag</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {filtered.map((lab) => (
                    <TableRow key={lab._id} sx={inErrorRowSx(lab.markedInError)}>
                      <TableCell>
                        <Stack direction="row" spacing={1} alignItems="center">
                          {lab.name}
                          {lab.markedInError && <InErrorBanner entry={lab} compact />}
                          {lab.lastModifiedAt && !lab.markedInError && (
                            <Typography variant="caption" sx={{ color: '#999', fontStyle: 'italic' }}>
                              (edited)
                            </Typography>
                          )}
                        </Stack>
                      </TableCell>
                      <TableCell>
                        {lab.value} {lab.unit}
                      </TableCell>
                      <TableCell sx={{ color: '#999' }}>{lab.referenceRange}</TableCell>
                      <TableCell>
                        {lab.flag ? (
                          <Chip
                            label={lab.flag}
                            size="small"
                            sx={{
                              backgroundColor: getFlagColor(lab.flag),
                              color: 'white',
                              fontWeight: 600,
                            }}
                          />
                        ) : (
                          <Typography variant="caption" sx={{ color: '#999' }}>
                            —
                          </Typography>
                        )}
                      </TableCell>
                      <TableCell sx={{ color: '#999' }}>
                        {new Date(lab.date).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <EditMenu
                          entry={lab}
                          onEdit={() => startEdit(lab)}
                          onMarkInError={() => setMarkInErrorFor(lab)}
                          onViewHistory={() => setHistoryFor(lab)}
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Grid>
        </Grid>
      )}

      <Dialog open={dialogOpen} onClose={() => setDialogOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>{editingId ? 'Edit Lab Result' : 'Add Lab Result'}</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Category
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              >
                {CATEGORIES.map((c) => (
                  <MenuItem key={c} value={c}>
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Date / Time Drawn"
                type="datetime-local"
                fullWidth
                size="small"
                InputLabelProps={{ shrink: true }}
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Test Name"
                placeholder="e.g., Sodium, Hemoglobin, Troponin I"
                fullWidth
                size="small"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Value"
                placeholder="e.g., 138"
                fullWidth
                size="small"
                value={form.value}
                onChange={(e) => setForm({ ...form, value: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Unit"
                placeholder="e.g., mEq/L, mg/dL, g/dL"
                fullWidth
                size="small"
                value={form.unit}
                onChange={(e) => setForm({ ...form, unit: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                label="Reference Range"
                placeholder="e.g., 136-145"
                fullWidth
                size="small"
                value={form.referenceRange}
                onChange={(e) => setForm({ ...form, referenceRange: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Flag
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.flag}
                onChange={(e) =>
                  setForm({ ...form, flag: e.target.value as '' | 'H' | 'L' | 'C' })
                }
              >
                <MenuItem value="">(none)</MenuItem>
                <MenuItem value="H">H — High</MenuItem>
                <MenuItem value="L">L — Low</MenuItem>
                <MenuItem value="C">C — Critical</MenuItem>
              </Select>
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
            disabled={loading || !form.name.trim() || !form.value.trim()}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : editingId ? 'Save Changes' : 'Save Result'}
          </Button>
        </DialogActions>
      </Dialog>

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="lab result"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="lab result"
      />
    </>
  )
}

export default ResultsTab
