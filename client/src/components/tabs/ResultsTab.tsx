import React, { useState } from 'react'
import {
  Box,
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
  Autocomplete,
  Slider,
  Stack,
  CircularProgress,
} from '@mui/material'
import SearchableSelect from 'components/common/SearchableSelect'
import type { LabResult } from '@types'
import type { Severity } from 'utils/vitalRanges'
import {
  LAB_CATALOG,
  PANELS,
  findLabEntry,
  findPanel,
  panelMembers,
  isNumericLab,
  getLabSeverity,
  computeLabFlag,
  defaultNumericValue,
  type LabCatalogEntry,
  type NumericLab,
} from 'data/labReference'
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

const severityColor = (sev: Severity): string =>
  sev === 'critical' ? '#d32f2f' : sev === 'borderline' ? '#ed6c02' : '#2e7d32'

// Clamp a stored/typed value into the slider's bounds for display.
const sliderValueFor = (def: NumericLab, raw: string): number => {
  const v = parseFloat(raw)
  if (Number.isNaN(v)) return defaultNumericValue(def)
  return Math.min(Math.max(v, def.min), def.max)
}

const ResultsTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const { addLab, addLabsBatch, editResource, markResourceInError, loading } = useChartingApi()
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [form, setForm] = useState(blankLab())
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editReason, setEditReason] = useState('')
  const [markInErrorFor, setMarkInErrorFor] = useState<LabResult | null>(null)
  const [historyFor, setHistoryFor] = useState<LabResult | null>(null)
  const [panelChoice, setPanelChoice] = useState<string>('')
  const [panelLoading, setPanelLoading] = useState(false)

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

  // --- Pivot derivations: transpose the flat lab list into a spreadsheet ---
  // Rows = test names (first-appearance order); columns = day-keys (newest first).
  const dayKey = (iso: string) => new Date(iso).toLocaleDateString()

  // Map each display day-key to its underlying timestamp so column ordering is based on
  // the real date, not on re-parsing a locale-formatted string (robust across locales).
  const dayKeyToTime: Record<string, number> = {}
  filtered.forEach((lab) => {
    const key = dayKey(lab.date)
    const t = new Date(lab.date).getTime()
    if (!(key in dayKeyToTime) || t > dayKeyToTime[key]) dayKeyToTime[key] = t
  })

  // Unique day-keys, sorted descending (newest/today left-most).
  const dateKeys = Array.from(new Set(filtered.map((lab) => dayKey(lab.date)))).sort(
    (a, b) => dayKeyToTime[b] - dayKeyToTime[a],
  )

  // Unique test names in first-appearance order (these become the rows).
  const testNames = Array.from(new Set(filtered.map((lab) => lab.name)))

  // Lookup: testName -> dayKey -> LabResult (last-writer-wins on name+day collision).
  const cellByNameDate: Record<string, Record<string, LabResult>> = {}
  filtered.forEach((lab) => {
    const key = dayKey(lab.date)
    if (!cellByNameDate[lab.name]) cellByNameDate[lab.name] = {}
    cellByNameDate[lab.name][key] = lab
  })

  // When the chosen test name matches a catalog entry, drive entry with the right input:
  // numeric → slider, qualitative → select, otherwise free text.
  const selectedEntry = findLabEntry(form.name)
  const numericDef =
    selectedEntry && isNumericLab(selectedEntry) ? selectedEntry : undefined
  const qualEntry =
    selectedEntry && selectedEntry.kind === 'qualitative' ? selectedEntry : undefined

  const applyLabEntry = (entry: LabCatalogEntry) => {
    if (isNumericLab(entry)) {
      const cur = parseFloat(form.value)
      const keep = !Number.isNaN(cur) && cur >= entry.min && cur <= entry.max
      const value = keep ? cur : defaultNumericValue(entry)
      setForm({
        ...form,
        name: entry.name,
        category: entry.category,
        unit: entry.unit,
        referenceRange: entry.referenceRange,
        value: String(value),
        flag: computeLabFlag(entry, value),
      })
    } else if (entry.kind === 'qualitative') {
      const value = entry.defaultResult || (entry.options && entry.options[0]) || ''
      setForm({
        ...form,
        name: entry.name,
        category: entry.category,
        unit: '',
        referenceRange: entry.referenceRange,
        value,
        flag: '',
      })
    } else {
      setForm({
        ...form,
        name: entry.name,
        category: entry.category,
        unit: entry.unit || '',
        referenceRange: entry.referenceRange,
        flag: '',
      })
    }
  }

  // Quick-add: batch-create every component of a panel with normal placeholder values.
  const handleAddPanel = async () => {
    if (!patient || !panelChoice) return
    const panel = findPanel(panelChoice)
    if (!panel) return
    setPanelLoading(true)
    const nowIso = new Date().toISOString()
    try {
      const payloads = panelMembers(panel).map((entry) => {
        let value = ''
        let flag: '' | 'H' | 'L' | 'C' = ''
        if (isNumericLab(entry)) {
          const v = defaultNumericValue(entry)
          value = String(v)
          flag = computeLabFlag(entry, v)
        } else if (entry.kind === 'qualitative') {
          value = entry.defaultResult || (entry.options && entry.options[0]) || ''
        }
        return {
          category: entry.category,
          name: entry.name,
          value,
          unit: isNumericLab(entry) ? entry.unit : '',
          referenceRange: entry.referenceRange,
          date: nowIso,
          flag: flag === '' ? undefined : flag,
        } as Omit<LabResult, '_id'>
      })
      if (payloads.length === 0) return
      const updated = await addLabsBatch(patient._id, payloads)
      setSelectedPatient(updated)
      setSelectedCategory(panel.category)
      setPanelChoice('')
    } catch (err) {
      console.error('Failed to add panel', err)
    } finally {
      setPanelLoading(false)
    }
  }

  return (
    <Box data-phi="true">
      <TabHeader title="Results" actionLabel="Add Lab Result" onAction={handleOpen} />

      <Paper sx={{ p: 1.5, mb: 2 }}>
        <Stack
          direction={{ xs: 'column', sm: 'row' }}
          spacing={1.5}
          alignItems={{ xs: 'stretch', sm: 'center' }}
        >
          <Autocomplete
            options={PANELS}
            getOptionLabel={(o) => o.name}
            value={PANELS.find((p) => p.name === panelChoice) || null}
            onChange={(_, v) => setPanelChoice(v ? v.name : '')}
            size="small"
            sx={{ minWidth: 280 }}
            renderInput={(params) => (
              <TextField
                {...params}
                label="Quick-add panel"
                placeholder="e.g., CMP, CBC, Lipid Panel"
                size="small"
              />
            )}
          />
          <Button
            variant="outlined"
            onClick={handleAddPanel}
            disabled={!panelChoice || panelLoading}
            startIcon={panelLoading ? <CircularProgress size={16} /> : undefined}
            sx={{ whiteSpace: 'nowrap' }}
          >
            Add Panel
          </Button>
          <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
            Adds each component with normal placeholder values — edit any abnormal results.
          </Typography>
        </Stack>
      </Paper>

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
            <TableContainer component={Paper} sx={{ overflowX: 'auto' }}>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600, minWidth: 200 }}>Test</TableCell>
                    {dateKeys.map((key) => (
                      <TableCell key={key} sx={{ fontWeight: 600, whiteSpace: 'nowrap' }}>
                        {key}
                      </TableCell>
                    ))}
                  </TableRow>
                </TableHead>
                <TableBody>
                  {testNames.map((name) => {
                    // Representative lab for this row (for unit / reference range display).
                    const rep = dateKeys
                      .map((key) => cellByNameDate[name]?.[key])
                      .find((l): l is LabResult => Boolean(l))
                    return (
                      <TableRow key={name}>
                        <TableCell sx={{ verticalAlign: 'top' }}>
                          <Typography variant="body2" sx={{ fontWeight: 600 }}>
                            {name}
                          </Typography>
                          {rep && (rep.unit || rep.referenceRange) && (
                            <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                              {[rep.unit, rep.referenceRange].filter(Boolean).join(' · ')}
                            </Typography>
                          )}
                        </TableCell>
                        {dateKeys.map((key) => {
                          const lab = cellByNameDate[name]?.[key]
                          if (!lab) {
                            return (
                              <TableCell key={key} sx={{ color: '#C4C4C4' }}>
                                —
                              </TableCell>
                            )
                          }
                          return (
                            <TableCell
                              key={key}
                              sx={{ ...inErrorRowSx(lab.markedInError), verticalAlign: 'top' }}
                            >
                              <Stack
                                direction="row"
                                spacing={0.5}
                                alignItems="center"
                                sx={{ flexWrap: 'wrap' }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: lab.flag ? 700 : 400,
                                    color: lab.flag ? getFlagColor(lab.flag) : 'inherit',
                                    whiteSpace: 'nowrap',
                                  }}
                                >
                                  {lab.value} {lab.unit}
                                </Typography>
                                {lab.flag && (
                                  <Chip
                                    label={lab.flag}
                                    size="small"
                                    sx={{
                                      backgroundColor: getFlagColor(lab.flag),
                                      color: 'white',
                                      fontWeight: 600,
                                      height: 18,
                                      '& .MuiChip-label': { px: 0.75 },
                                    }}
                                  />
                                )}
                                <EditMenu
                                  entry={lab}
                                  onEdit={() => startEdit(lab)}
                                  onMarkInError={() => setMarkInErrorFor(lab)}
                                  onViewHistory={() => setHistoryFor(lab)}
                                />
                              </Stack>
                              {lab.markedInError && <InErrorBanner entry={lab} compact />}
                              {lab.lastModifiedAt && !lab.markedInError && (
                                <Typography
                                  variant="caption"
                                  sx={{ color: '#6B6B6B', fontStyle: 'italic', display: 'block' }}
                                >
                                  (edited)
                                </Typography>
                              )}
                            </TableCell>
                          )
                        })}
                      </TableRow>
                    )
                  })}
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
              <SearchableSelect
                label="Category"
                value={form.category}
                onChange={(v) => setForm({ ...form, category: v })}
                options={CATEGORIES}
                freeSolo
              />
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
              <Autocomplete
                freeSolo
                options={LAB_CATALOG}
                groupBy={(option) => (typeof option === 'string' ? '' : option.category)}
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.name)}
                filterOptions={(options, state) => {
                  const q = state.inputValue.trim().toLowerCase()
                  if (!q) return options
                  return options.filter(
                    (o) =>
                      o.name.toLowerCase().includes(q) ||
                      (o.aliases || []).some((a) => a.toLowerCase().includes(q)),
                  )
                }}
                inputValue={form.name}
                onInputChange={(_, newInput, reason) => {
                  if (reason === 'reset') return
                  const entry = findLabEntry(newInput)
                  if (entry) {
                    applyLabEntry(entry)
                  } else {
                    setForm({ ...form, name: newInput })
                  }
                }}
                onChange={(_, newValue) => {
                  if (newValue && typeof newValue !== 'string') applyLabEntry(newValue)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Test Name"
                    placeholder="Search e.g., Sodium, Hemoglobin, Troponin I"
                    size="small"
                  />
                )}
              />
            </Grid>

            {numericDef ? (
              <Grid item xs={12}>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="baseline"
                  sx={{ mb: 0.5, flexWrap: 'wrap' }}
                >
                  <Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
                    Value: {sliderValueFor(numericDef, form.value)} {numericDef.unit}
                  </Typography>
                  {(() => {
                    const v = sliderValueFor(numericDef, form.value)
                    const f = computeLabFlag(numericDef, v)
                    return f ? (
                      <Chip
                        label={f}
                        size="small"
                        sx={{ backgroundColor: getFlagColor(f), color: 'white', fontWeight: 600 }}
                      />
                    ) : null
                  })()}
                  <Typography variant="caption" sx={{ color: '#6B6B6B', ml: 'auto' }}>
                    Reference: {numericDef.referenceRange}
                  </Typography>
                </Stack>
                <Box sx={{ px: 1 }}>
                  <Slider
                    min={numericDef.min}
                    max={numericDef.max}
                    step={numericDef.step}
                    value={sliderValueFor(numericDef, form.value)}
                    onChange={(_, val) => {
                      const v = val as number
                      setForm({ ...form, value: String(v), flag: computeLabFlag(numericDef, v) })
                    }}
                    marks={[
                      { value: numericDef.normalLow, label: String(numericDef.normalLow) },
                      { value: numericDef.normalHigh, label: String(numericDef.normalHigh) },
                    ]}
                    valueLabelDisplay="auto"
                    aria-label={`${numericDef.name} value`}
                    aria-valuetext={`${sliderValueFor(numericDef, form.value)} ${numericDef.unit}`}
                    sx={{
                      color: severityColor(
                        getLabSeverity(numericDef, sliderValueFor(numericDef, form.value)),
                      ),
                    }}
                  />
                </Box>
              </Grid>
            ) : qualEntry ? (
              <Grid item xs={12}>
                <SearchableSelect
                  label="Result"
                  value={form.value}
                  onChange={(v) => setForm({ ...form, value: v })}
                  options={qualEntry.options || []}
                  helperText={`Expected: ${qualEntry.referenceRange}`}
                  freeSolo
                />
              </Grid>
            ) : (
              <>
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
              </>
            )}
            <Grid item xs={12} sm={6}>
              <SearchableSelect
                label="Flag"
                value={form.flag}
                onChange={(v) => setForm({ ...form, flag: v as '' | 'H' | 'L' | 'C' })}
                options={[
                  { value: '', label: '(none)' },
                  { value: 'H', label: 'H — High' },
                  { value: 'L', label: 'L — Low' },
                  { value: 'C', label: 'C — Critical' },
                ]}
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
    </Box>
  )
}

export default ResultsTab
