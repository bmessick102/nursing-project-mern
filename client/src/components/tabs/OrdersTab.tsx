import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Stack,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Select,
  MenuItem,
  Grid,
  CircularProgress,
  IconButton,
  Autocomplete,
} from '@mui/material'
import { Add, Delete, Edit as EditIcon } from '@mui/icons-material'
import type { Order } from '@types'
import { LAB_CATALOG, PANELS } from 'data/labReference'
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

type OrderTypeKey = Order['type']

const TAB_LABELS = ['Medications', 'Diet', 'Labs', 'Nursing', 'Therapies', 'Discharge Summary']
const TAB_ORDER_TYPES: OrderTypeKey[] = ['medication', 'diet', 'lab', 'nursing', 'therapy']
const DISCHARGE_TAB_INDEX = 5

const blankForm = () => ({
  name: '',
  details: '',
  status: 'active' as Order['status'],
  priority: 'routine' as NonNullable<Order['priority']>,
  orderedBy: '',
})

const blankDischarge = () => ({
  anticipatedDate: new Date().toISOString().slice(0, 10),
  condition: '',
  instructions: [] as string[],
})

const capitalize = (s: string) => (s.length === 0 ? s : s[0].toUpperCase() + s.slice(1))

interface LabOrderOption {
  name: string
  group: string
  detail: string
}

// Panels listed first, then individual tests grouped by category. Used to autofill the
// Order Name + Details on the Labs sub-tab.
const LAB_ORDER_OPTIONS: LabOrderOption[] = [
  ...PANELS.map((p) => ({
    name: p.name,
    group: 'Panels',
    detail: `Includes: ${p.members.join(', ')}`,
  })),
  ...LAB_CATALOG.map((e) => ({
    name: e.name,
    group: e.category,
    detail: `Reference: ${e.referenceRange}`,
  })),
]

// Order Name input: a searchable lab/panel picker on the Labs sub-tab, a plain text field
// elsewhere. Selecting a lab/panel autofills Details when empty.
const OrderNameField: React.FC<{
  isLab: boolean
  name: string
  onName: (name: string) => void
  onAutofillDetails: (detail: string) => void
  placeholder?: string
}> = ({ isLab, name, onName, onAutofillDetails, placeholder }) => {
  if (!isLab) {
    return (
      <TextField
        label="Order Name"
        placeholder={placeholder}
        fullWidth
        size="small"
        value={name}
        onChange={(e) => onName(e.target.value)}
      />
    )
  }
  return (
    <Autocomplete
      freeSolo
      options={LAB_ORDER_OPTIONS}
      groupBy={(o) => (typeof o === 'string' ? '' : o.group)}
      getOptionLabel={(o) => (typeof o === 'string' ? o : o.name)}
      filterOptions={(opts, state) => {
        const q = state.inputValue.trim().toLowerCase()
        if (!q) return opts
        return opts.filter((o) => o.name.toLowerCase().includes(q))
      }}
      inputValue={name}
      onInputChange={(_, v, reason) => {
        if (reason === 'reset') return
        onName(v)
      }}
      onChange={(_, v) => {
        if (v && typeof v !== 'string') {
          onName(v.name)
          onAutofillDetails(v.detail)
        }
      }}
      renderInput={(params) => (
        <TextField
          {...params}
          label="Order Name"
          placeholder="Search lab tests & panels…"
          size="small"
        />
      )}
    />
  )
}

const OrdersTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const { addOrder, editResource, markResourceInError, updatePatientFields, loading } =
    useChartingApi()
  const [tabValue, setTabValue] = useState(0)
  const [editingOrder, setEditingOrder] = useState<Order | null>(null)
  const [addOpen, setAddOpen] = useState(false)
  const [form, setForm] = useState(blankForm())
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<Order | null>(null)
  const [historyFor, setHistoryFor] = useState<Order | null>(null)
  const [dischargeOpen, setDischargeOpen] = useState(false)
  const [dischargeForm, setDischargeForm] = useState(blankDischarge())
  const [instructionDraft, setInstructionDraft] = useState('')

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#003D82'
      case 'completed':
        return '#6B6B6B'
      case 'discontinued':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'stat':
        return 'STAT'
      case 'urgent':
        return 'URGENT'
      default:
        return 'ROUTINE'
    }
  }

  const orders = patient.orders || []

  const startEdit = (order: Order) => {
    setEditingOrder(order)
    setForm({
      name: order.name,
      details: order.details,
      status: order.status,
      priority: order.priority || 'routine',
      orderedBy: order.orderedBy,
    })
    setEditReason('')
  }

  const startAdd = () => {
    setForm({ ...blankForm(), orderedBy: username })
    setAddOpen(true)
  }

  const startEditDischarge = () => {
    if (patient.dischargeSummary) {
      setDischargeForm({
        anticipatedDate: new Date(patient.dischargeSummary.anticipatedDate)
          .toISOString()
          .slice(0, 10),
        condition: patient.dischargeSummary.condition,
        instructions: [...patient.dischargeSummary.instructions],
      })
    } else {
      setDischargeForm(blankDischarge())
    }
    setInstructionDraft('')
    setDischargeOpen(true)
  }

  const handleAddInstruction = () => {
    const v = instructionDraft.trim()
    if (!v) return
    setDischargeForm({
      ...dischargeForm,
      instructions: [...dischargeForm.instructions, v],
    })
    setInstructionDraft('')
  }

  const handleRemoveInstruction = (idx: number) => {
    setDischargeForm({
      ...dischargeForm,
      instructions: dischargeForm.instructions.filter((_, i) => i !== idx),
    })
  }

  const handleDischargeSubmit = async () => {
    if (!dischargeForm.condition.trim()) return
    try {
      const updated = await updatePatientFields(patient._id, {
        dischargeSummary: {
          anticipatedDate: new Date(dischargeForm.anticipatedDate).toISOString(),
          condition: dischargeForm.condition.trim(),
          instructions: dischargeForm.instructions,
        },
      })
      setSelectedPatient(updated)
      setDischargeOpen(false)
    } catch (err) {
      console.error('Failed to save discharge summary', err)
    }
  }

  const handleAddSubmit = async () => {
    if (!form.name.trim()) return
    const typeForTab = tabValue < TAB_ORDER_TYPES.length ? TAB_ORDER_TYPES[tabValue] : 'medication'
    try {
      const payload: Omit<Order, '_id'> = {
        type: typeForTab,
        name: form.name.trim(),
        details: form.details.trim(),
        status: form.status,
        priority: form.priority,
        orderedBy: form.orderedBy.trim() || username,
        date: new Date().toISOString(),
      }
      const updated = await addOrder(patient._id, payload)
      setSelectedPatient(updated)
      setAddOpen(false)
    } catch (err) {
      console.error('Failed to add order', err)
    }
  }

  const handleEditSubmit = async () => {
    if (!editingOrder) return
    try {
      const updated = await editResource(
        patient._id,
        'orders',
        editingOrder._id,
        {
          name: form.name.trim(),
          details: form.details.trim(),
          status: form.status,
          priority: form.priority,
          orderedBy: form.orderedBy.trim() || username,
        },
        editReason || undefined,
      )
      setSelectedPatient(updated)
      setEditingOrder(null)
      setEditReason('')
    } catch (err) {
      console.error('Failed to edit order', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'orders',
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

  const subtabsBar = (
    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
      <Tabs
        value={tabValue}
        onChange={(_, val) => setTabValue(val)}
        variant="scrollable"
        scrollButtons="auto"
      >
        {TAB_LABELS.map((tab) => (
          <Tab key={tab} label={tab} />
        ))}
      </Tabs>
    </Box>
  )

  const editingDialogTitleType =
    tabValue < TAB_ORDER_TYPES.length ? TAB_LABELS[tabValue].replace(/s$/, '') : ''

  if (tabValue === DISCHARGE_TAB_INDEX) {
    return (
      <Box data-phi="true">
        <TabHeader
          title="Orders"
          actionLabel={patient.dischargeSummary ? 'Edit Discharge Summary' : 'Add Discharge Summary'}
          actionIcon={patient.dischargeSummary ? <EditIcon /> : undefined}
          onAction={startEditDischarge}
        />
        <Paper className={styles.section}>
          {subtabsBar}
          {patient.dischargeSummary ? (
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
                Anticipated Discharge Date
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {new Date(patient.dischargeSummary.anticipatedDate).toLocaleDateString()}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
                Condition at Discharge
              </Typography>
              <Typography variant="body2" sx={{ mb: 2 }}>
                {patient.dischargeSummary.condition}
              </Typography>

              <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
                Discharge Instructions
              </Typography>
              {patient.dischargeSummary.instructions.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#6B6B6B', fontStyle: 'italic' }}>
                  No instructions documented.
                </Typography>
              ) : (
                <Box component="ul" sx={{ mt: 1 }}>
                  {patient.dischargeSummary.instructions.map((instr, idx) => (
                    <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                      {instr}
                    </Typography>
                  ))}
                </Box>
              )}
            </Box>
          ) : (
            <Box className={styles.emptyState}>
              <Typography>No discharge summary yet.</Typography>
              <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6B6B6B' }}>
                Click "Add Discharge Summary" to create one.
              </Typography>
            </Box>
          )}
        </Paper>

        <Dialog open={dischargeOpen} onClose={() => setDischargeOpen(false)} maxWidth="md" fullWidth>
          <DialogTitle>
            {patient.dischargeSummary ? 'Edit Discharge Summary' : 'Add Discharge Summary'}
          </DialogTitle>
          <DialogContent>
            <Grid container spacing={2} sx={{ mt: 0 }}>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Anticipated Discharge Date"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={dischargeForm.anticipatedDate}
                  onChange={(e) =>
                    setDischargeForm({ ...dischargeForm, anticipatedDate: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12} sm={8}>
                <TextField
                  label="Condition at Discharge"
                  placeholder="e.g., Stable, hypertension controlled, glucose improved"
                  fullWidth
                  size="small"
                  value={dischargeForm.condition}
                  onChange={(e) =>
                    setDischargeForm({ ...dischargeForm, condition: e.target.value })
                  }
                />
              </Grid>
              <Grid item xs={12}>
                <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                  Discharge Instructions
                </Typography>
                <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
                  <TextField
                    placeholder='e.g., "Take all medications as prescribed"'
                    fullWidth
                    size="small"
                    value={instructionDraft}
                    onChange={(e) => setInstructionDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault()
                        handleAddInstruction()
                      }
                    }}
                  />
                  <Button variant="outlined" startIcon={<Add />} onClick={handleAddInstruction}>
                    Add
                  </Button>
                </Stack>
                {dischargeForm.instructions.length === 0 ? (
                  <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                    No instructions yet.
                  </Typography>
                ) : (
                  <TableContainer component={Paper} variant="outlined">
                    <Table size="small">
                      <TableBody>
                        {dischargeForm.instructions.map((instr, idx) => (
                          <TableRow key={idx}>
                            <TableCell>{instr}</TableCell>
                            <TableCell sx={{ width: 50 }}>
                              <IconButton
                                size="small"
                                onClick={() => handleRemoveInstruction(idx)}
                                aria-label="remove instruction"
                              >
                                <Delete fontSize="small" sx={{ color: '#d32f2f' }} />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDischargeOpen(false)}>Cancel</Button>
            <Button
              variant="contained"
              onClick={handleDischargeSubmit}
              disabled={loading || !dischargeForm.condition.trim()}
              sx={{ backgroundColor: '#003D82' }}
            >
              {loading ? <CircularProgress size={20} /> : 'Save'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    )
  }

  const type = TAB_ORDER_TYPES[tabValue]
  const filteredOrders = orders.filter((order) => order.type === type)

  return (
    <Box data-phi="true">
      <TabHeader title="Orders" actionLabel="Add Order" onAction={startAdd} />
      <Paper className={styles.section}>
        {subtabsBar}

        {filteredOrders.length === 0 ? (
          <Box className={styles.emptyState}>
            <Typography>No {TAB_LABELS[tabValue].toLowerCase()} orders</Typography>
            <Typography variant="caption" sx={{ display: 'block', mt: 1, color: '#6B6B6B' }}>
              Click "Add Order" to document the first one.
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Order Name</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Ordered By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order._id} sx={inErrorRowSx(order.markedInError)}>
                    <TableCell sx={{ fontWeight: 500 }}>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {order.name}
                        {order.markedInError && <InErrorBanner entry={order} compact />}
                        {order.lastModifiedAt && !order.markedInError && (
                          <Typography variant="caption" sx={{ color: '#6B6B6B', fontStyle: 'italic' }}>
                            (edited)
                          </Typography>
                        )}
                      </Stack>
                    </TableCell>
                    <TableCell sx={{ color: '#666', fontSize: '0.875rem' }}>
                      {order.details}
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={getPriorityLabel(order.priority)}
                        size="small"
                        sx={{
                          backgroundColor:
                            order.priority === 'stat'
                              ? '#d32f2f'
                              : order.priority === 'urgent'
                              ? '#FF9800'
                              : '#6B6B6B',
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell>
                      <Chip
                        label={capitalize(order.status)}
                        size="small"
                        sx={{
                          backgroundColor: getStatusColor(order.status),
                          color: 'white',
                          fontWeight: 600,
                        }}
                      />
                    </TableCell>
                    <TableCell sx={{ color: '#666' }}>{order.orderedBy}</TableCell>
                    <TableCell sx={{ color: '#6B6B6B' }}>
                      {new Date(order.date).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <EditMenu
                        entry={order}
                        onEdit={() => startEdit(order)}
                        onMarkInError={() => setMarkInErrorFor(order)}
                        onViewHistory={() => setHistoryFor(order)}
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
        open={editingOrder !== null}
        onClose={() => setEditingOrder(null)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Edit {editingDialogTitleType} Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <OrderNameField
                isLab={editingOrder?.type === 'lab'}
                name={form.name}
                onName={(n) => setForm((prev) => ({ ...prev, name: n }))}
                onAutofillDetails={(d) =>
                  setForm((prev) => (prev.details.trim() ? prev : { ...prev, details: d }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Details"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Status
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.status}
                aria-label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value as Order['status'] })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Priority
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.priority}
                aria-label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value as NonNullable<Order['priority']> })}
              >
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="stat">STAT</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ordered By"
                fullWidth
                size="small"
                value={form.orderedBy}
                onChange={(e) => setForm({ ...form, orderedBy: e.target.value })}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Reason for edit (optional)"
                fullWidth
                size="small"
                value={editReason}
                onChange={(e) => setEditReason(e.target.value)}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditingOrder(null)}>Cancel</Button>
          <Button
            onClick={handleEditSubmit}
            variant="contained"
            disabled={loading || !form.name.trim()}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save Changes'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={addOpen} onClose={() => setAddOpen(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add {editingDialogTitleType} Order</DialogTitle>
        <DialogContent>
          <Grid container spacing={2} sx={{ mt: 0 }}>
            <Grid item xs={12}>
              <OrderNameField
                isLab={TAB_ORDER_TYPES[tabValue] === 'lab'}
                name={form.name}
                placeholder='e.g., "Acetaminophen 650mg PO Q6H PRN" or "CBC with diff"'
                onName={(n) => setForm((prev) => ({ ...prev, name: n }))}
                onAutofillDetails={(d) =>
                  setForm((prev) => (prev.details.trim() ? prev : { ...prev, details: d }))
                }
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Details"
                placeholder="Indication, route, special instructions"
                fullWidth
                multiline
                minRows={2}
                size="small"
                value={form.details}
                onChange={(e) => setForm({ ...form, details: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Status
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.status}
                aria-label="Status"
                onChange={(e) => setForm({ ...form, status: e.target.value as Order['status'] })}
              >
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="completed">Completed</MenuItem>
                <MenuItem value="discontinued">Discontinued</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                Priority
              </Typography>
              <Select
                fullWidth
                size="small"
                value={form.priority}
                aria-label="Priority"
                onChange={(e) => setForm({ ...form, priority: e.target.value as NonNullable<Order['priority']> })}
              >
                <MenuItem value="routine">Routine</MenuItem>
                <MenuItem value="urgent">Urgent</MenuItem>
                <MenuItem value="stat">STAT</MenuItem>
              </Select>
            </Grid>
            <Grid item xs={12}>
              <TextField
                label="Ordered By"
                placeholder="Provider / your name if entering as student"
                fullWidth
                size="small"
                value={form.orderedBy}
                onChange={(e) => setForm({ ...form, orderedBy: e.target.value })}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setAddOpen(false)}>Cancel</Button>
          <Button
            onClick={handleAddSubmit}
            variant="contained"
            disabled={loading || !form.name.trim()}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Add Order'}
          </Button>
        </DialogActions>
      </Dialog>

      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="order"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="order"
      />
    </Box>
  )
}

export default OrdersTab
