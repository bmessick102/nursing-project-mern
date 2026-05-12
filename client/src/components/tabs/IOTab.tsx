import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
} from '@mui/material'
import type { Patient, IOEntry } from '@types'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import EditMenu from 'components/edit/EditMenu'
import MarkInErrorDialog from 'components/edit/MarkInErrorDialog'
import ModificationHistory from 'components/edit/ModificationHistory'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import { Stack } from '@mui/material'
import TabHeader from 'components/common/TabHeader'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

interface IOTabProps {
  patient: Patient | null
}

const blankForm = () => ({
  type: 'intake' as 'intake' | 'output',
  category: 'Oral',
  amount: '',
  unit: 'mL',
})

const IOTab: React.FC<IOTabProps> = ({ patient }) => {
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const [tabValue, setTabValue] = useState(0)
  const [form, setForm] = useState(blankForm())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<IOEntry | null>(null)
  const [historyFor, setHistoryFor] = useState<IOEntry | null>(null)
  const { addIO, editResource, markResourceInError, loading } = useChartingApi()

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const ioEntries = patient?.ioEntries || []
  const intakeCategories = ['Oral', 'IV', 'Tube Feeding', 'Other']
  const outputCategories = ['Urine', 'Stool', 'Vomitus', 'Drainage', 'Other']

  const startEdit = (io: IOEntry) => {
    setEditingId(io._id)
    setForm({
      type: io.type,
      category: io.category,
      amount: String(io.amount),
      unit: io.unit,
    })
    setEditReason('')
    setTabValue(1)
  }

  const handleSubmit = async () => {
    if (!form.amount) return

    try {
      if (editingId) {
        const updated = await editResource(
          patient._id,
          'io',
          editingId,
          {
            type: form.type,
            category: form.category,
            amount: parseInt(form.amount),
            unit: form.unit,
          },
          editReason || undefined,
        )
        setSelectedPatient(updated)
      } else {
        const io: Omit<IOEntry, '_id'> = {
          timestamp: new Date().toISOString(),
          type: form.type,
          category: form.category,
          amount: parseInt(form.amount),
          unit: form.unit,
          documentedBy: username,
        }
        const updated = await addIO(patient._id, io)
        setSelectedPatient(updated)
      }
      setForm(blankForm())
      setEditingId(null)
      setEditReason('')
      setTabValue(0)
    } catch (err) {
      console.error('Failed to save I/O entry', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'io',
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

  const intakes = ioEntries.filter((io) => io.type === 'intake')
  const outputs = ioEntries.filter((io) => io.type === 'output')
  const totalIntake = intakes.reduce((sum, io) => sum + io.amount, 0)
  const totalOutput = outputs.reduce((sum, io) => sum + io.amount, 0)
  const balance = totalIntake - totalOutput

  return (
    <>
      <TabHeader
        title="Intake & Output"
        actionLabel="Log I/O"
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
          <Tab label="View" />
          <Tab label="Document" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#E3F2FD', borderLeft: '4px solid #003D82' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Intake
                </Typography>
                <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600 }}>
                  {totalIntake} mL
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Output
                </Typography>
                <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 600 }}>
                  {totalOutput} mL
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: balance >= 0 ? '#E8F5E9' : '#FFEBEE', borderLeft: `4px solid ${balance >= 0 ? '#4CAF50' : '#d32f2f'}` }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Balance
                </Typography>
                <Typography variant="h6" sx={{ color: balance >= 0 ? '#4CAF50' : '#d32f2f', fontWeight: 600 }}>
                  {balance > 0 ? '+' : ''}{balance} mL
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Intake
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#E3F2FD' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...intakes].reverse().map((io) => (
                      <TableRow key={io._id} sx={inErrorRowSx(io.markedInError)}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {new Date(io.timestamp).toLocaleTimeString()}
                            {io.markedInError && <InErrorBanner entry={io} compact />}
                          </Stack>
                        </TableCell>
                        <TableCell>{io.category}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <span>{io.amount} {io.unit || 'mL'}</span>
                            <EditMenu
                              entry={io}
                              onEdit={() => startEdit(io)}
                              onMarkInError={() => setMarkInErrorFor(io)}
                              onViewHistory={() => setHistoryFor(io)}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Output
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...outputs].reverse().map((io) => (
                      <TableRow key={io._id} sx={inErrorRowSx(io.markedInError)}>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center">
                            {new Date(io.timestamp).toLocaleTimeString()}
                            {io.markedInError && <InErrorBanner entry={io} compact />}
                          </Stack>
                        </TableCell>
                        <TableCell>{io.category}</TableCell>
                        <TableCell>
                          <Stack direction="row" spacing={1} alignItems="center" justifyContent="space-between">
                            <span>{io.amount} {io.unit || 'mL'}</span>
                            <EditMenu
                              entry={io}
                              onEdit={() => startEdit(io)}
                              onMarkInError={() => setMarkInErrorFor(io)}
                              onViewHistory={() => setHistoryFor(io)}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Type
            </Typography>
            <RadioGroup
              row
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as 'intake' | 'output',
                  category: e.target.value === 'intake' ? 'Oral' : 'Urine',
                })
              }
            >
              <FormControlLabel value="intake" control={<Radio />} label="Intake" />
              <FormControlLabel value="output" control={<Radio />} label="Output" />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
            >
              {(form.type === 'intake' ? intakeCategories : outputCategories).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} fullWidth>
              <MenuItem value="mL">mL</MenuItem>
              <MenuItem value="cc">cc</MenuItem>
              <MenuItem value="L">L</MenuItem>
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

          <Grid item xs={12}>
            <Stack direction="row" spacing={1}>
              <Button
                variant="contained"
                onClick={handleSubmit}
                disabled={loading || !form.amount}
                sx={{ backgroundColor: '#003D82' }}
              >
                {loading ? <CircularProgress size={20} /> : editingId ? 'Save Changes' : 'Log I/O'}
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

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="I/O entry"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="I/O entry"
      />
      </Paper>
    </>
  )
}

export default IOTab
