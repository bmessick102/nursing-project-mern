import React, { useState } from 'react'
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
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Stack,
  CircularProgress,
  Autocomplete,
} from '@mui/material'
import { Edit as EditIcon, Add, Delete, Warning as WarningIcon } from '@mui/icons-material'
import type { Patient } from '@types'
import SearchableSelect from 'components/common/SearchableSelect'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import {
  ALLERGENS,
  DIAGNOSES,
  MEDICATIONS,
  MED_FREQUENCIES,
  COMMON_DOSES,
  findMedication,
} from 'data/clinicalReference'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

type ManageMode = 'allergies' | 'diagnosis' | 'medications' | null

interface MedicationDraft {
  name: string
  dose: string
  frequency: string
}

// Medications sorted by drug class so the Autocomplete's grouped headers stay contiguous.
const MED_OPTIONS = [...MEDICATIONS].sort(
  (a, b) => a.drugClass.localeCompare(b.drugClass) || a.name.localeCompare(b.name),
)

const SummaryTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { updatePatientFields, loading } = useChartingApi()
  const [mode, setMode] = useState<ManageMode>(null)
  const [strList, setStrList] = useState<string[]>([])
  const [strInput, setStrInput] = useState('')
  const [medList, setMedList] = useState<MedicationDraft[]>([])
  const [medDraft, setMedDraft] = useState<MedicationDraft>({ name: '', dose: '', frequency: '' })

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const latestVitals = patient.vitals?.[patient.vitals.length - 1]
  const medCount = patient.medications?.length || 0
  const labCount = patient.labs?.length || 0
  const noteCount = patient.nursingNotes?.length || 0

  const startManage = (m: Exclude<ManageMode, null>) => {
    setMode(m)
    setStrInput('')
    setMedDraft({ name: '', dose: '', frequency: '' })
    if (m === 'allergies') setStrList([...(patient.allergies || [])])
    if (m === 'diagnosis') setStrList([...(patient.diagnosis || [])])
    if (m === 'medications') setMedList([...(patient.medications || [])])
  }

  const closeManage = () => {
    if (loading) return
    setMode(null)
  }

  const addStrValue = (raw: string) => {
    const v = raw.trim()
    if (!v) return
    if (strList.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setStrInput('')
      return
    }
    setStrList([...strList, v])
    setStrInput('')
  }

  const handleAddStr = () => addStrValue(strInput)

  const handleRemoveStr = (idx: number) => {
    setStrList(strList.filter((_, i) => i !== idx))
  }

  const handleAddMed = () => {
    const name = medDraft.name.trim()
    const dose = medDraft.dose.trim()
    const frequency = medDraft.frequency.trim()
    if (!name || !dose) return
    setMedList([...medList, { name, dose, frequency }])
    setMedDraft({ name: '', dose: '', frequency: '' })
  }

  const handleRemoveMed = (idx: number) => {
    setMedList(medList.filter((_, i) => i !== idx))
  }

  const handleSave = async () => {
    try {
      let patch: Partial<Pick<Patient, 'allergies' | 'diagnosis' | 'medications'>> = {}
      if (mode === 'allergies') patch.allergies = strList
      if (mode === 'diagnosis') patch.diagnosis = strList
      if (mode === 'medications') patch.medications = medList
      const updated = await updatePatientFields(patient._id, patch)
      setSelectedPatient(updated)
      setMode(null)
    } catch (err) {
      console.error('Failed to save patient fields', err)
    }
  }

  // Dose/Frequency dropdown options for the medication draft. The selected drug's typical
  // dose and the current draft value are always included so the Select never shows blank.
  const selectedMed = findMedication(medDraft.name)
  const doseOptions = Array.from(
    new Set(
      [
        ...(selectedMed ? [selectedMed.defaultDose] : []),
        ...COMMON_DOSES,
        ...(medDraft.dose ? [medDraft.dose] : []),
      ].filter(Boolean),
    ),
  )
  const freqOptions = Array.from(
    new Set([...MED_FREQUENCIES, ...(medDraft.frequency ? [medDraft.frequency] : [])].filter(Boolean)),
  )

  return (
    <Box data-phi="true">
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

        <Grid item xs={12} md={6}>
          <Paper className={styles.section}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" className={styles.sectionTitle} sx={{ flex: 1 }}>
                Allergies
              </Typography>
              <IconButton size="small" onClick={() => startManage('allergies')} aria-label="manage allergies">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box className={styles.chipContainer}>
              {patient.allergies.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No known allergies
                </Typography>
              ) : (
                patient.allergies.map((allergy, idx) => (
                  <Chip
                    key={idx}
                    icon={<WarningIcon fontSize="small" />}
                    label={allergy}
                    variant="outlined"
                    aria-label={`Allergy: ${allergy}`}
                    sx={{
                      mr: 1,
                      mb: 1,
                      color: '#B71C1C',
                      borderColor: '#B71C1C',
                      fontWeight: 600,
                      '& .MuiChip-icon': { color: '#B71C1C' },
                    }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className={styles.section}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" className={styles.sectionTitle} sx={{ flex: 1 }}>
                Active Diagnoses
              </Typography>
              <IconButton size="small" onClick={() => startManage('diagnosis')} aria-label="manage diagnoses">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            <Box className={styles.chipContainer}>
              {patient.diagnosis.length === 0 ? (
                <Typography variant="body2" color="textSecondary">
                  No active diagnoses
                </Typography>
              ) : (
                patient.diagnosis.map((diag, idx) => (
                  <Chip
                    key={idx}
                    label={diag}
                    variant="outlined"
                    sx={{ mr: 1, mb: 1, color: '#003D82', borderColor: '#003D82', fontWeight: 600 }}
                  />
                ))
              )}
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper className={styles.section}>
            <Stack direction="row" justifyContent="space-between" alignItems="center">
              <Typography variant="h6" className={styles.sectionTitle} sx={{ flex: 1 }}>
                Current Medications
              </Typography>
              <IconButton size="small" onClick={() => startManage('medications')} aria-label="manage medications">
                <EditIcon fontSize="small" />
              </IconButton>
            </Stack>
            {patient.medications.length === 0 ? (
              <Typography variant="body2" color="textSecondary">
                No medications recorded
              </Typography>
            ) : (
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
            )}
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={mode === 'allergies' || mode === 'diagnosis'} onClose={closeManage} maxWidth="sm" fullWidth>
        <DialogTitle>
          {mode === 'allergies' ? 'Manage Allergies' : 'Manage Active Diagnoses'}
        </DialogTitle>
        <DialogContent>
          <Stack direction="row" spacing={1} sx={{ mb: 2, mt: 1 }}>
            <Autocomplete
              freeSolo
              fullWidth
              options={(mode === 'allergies' ? ALLERGENS : DIAGNOSES).filter(
                (o) => !strList.includes(o),
              )}
              inputValue={strInput}
              onInputChange={(_, v, reason) => {
                if (reason !== 'reset') setStrInput(v)
              }}
              onChange={(_, v) => {
                if (typeof v === 'string') addStrValue(v)
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={mode === 'allergies' ? 'Allergen' : 'Diagnosis'}
                  placeholder={
                    mode === 'allergies'
                      ? 'Search or type an allergy…'
                      : 'Search or type a diagnosis…'
                  }
                  size="small"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && strInput.trim()) {
                      e.preventDefault()
                      handleAddStr()
                    }
                  }}
                />
              )}
            />
            <Button variant="outlined" startIcon={<Add />} onClick={handleAddStr}>
              Add
            </Button>
          </Stack>
          {strList.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
              No entries.
            </Typography>
          ) : (
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {strList.map((item, idx) => (
                <Chip
                  key={idx}
                  label={item}
                  onDelete={() => handleRemoveStr(idx)}
                  sx={{
                    color: mode === 'allergies' ? '#B71C1C' : '#003D82',
                    borderColor: mode === 'allergies' ? '#B71C1C' : '#003D82',
                    fontWeight: 600,
                  }}
                  variant="outlined"
                />
              ))}
            </Stack>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManage}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={mode === 'medications'} onClose={closeManage} maxWidth="md" fullWidth>
        <DialogTitle>Manage Current Medications</DialogTitle>
        <DialogContent>
          <Grid container spacing={1} sx={{ mb: 2, mt: 1 }}>
            <Grid item xs={12} sm={5}>
              <Autocomplete
                freeSolo
                fullWidth
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
                inputValue={medDraft.name}
                onInputChange={(_, v, reason) => {
                  if (reason === 'reset') return
                  setMedDraft((prev) => ({ ...prev, name: v }))
                }}
                onChange={(_, v) => {
                  if (v && typeof v !== 'string') {
                    setMedDraft({
                      name: v.name,
                      dose: v.defaultDose,
                      frequency: v.defaultFrequency,
                    })
                  }
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Medication"
                    placeholder="Search medications…"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <Autocomplete
                freeSolo
                fullWidth
                options={doseOptions}
                inputValue={medDraft.dose}
                onInputChange={(_, v, reason) => {
                  if (reason !== 'reset') setMedDraft((prev) => ({ ...prev, dose: v }))
                }}
                onChange={(_, v) => {
                  if (typeof v === 'string') setMedDraft((prev) => ({ ...prev, dose: v }))
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    label="Dose"
                    placeholder="Select or type a dose…"
                    size="small"
                  />
                )}
              />
            </Grid>
            <Grid item xs={6} sm={3}>
              <SearchableSelect
                label="Frequency"
                freeSolo
                placeholder="Select or type…"
                value={medDraft.frequency}
                onChange={(v) => setMedDraft((prev) => ({ ...prev, frequency: v }))}
                options={freqOptions}
              />
            </Grid>
            <Grid item xs={12} sm={1}>
              <Button
                variant="outlined"
                fullWidth
                onClick={handleAddMed}
                disabled={!medDraft.name.trim() || !medDraft.dose.trim()}
                sx={{ height: '100%' }}
              >
                <Add />
              </Button>
            </Grid>
          </Grid>
          {medList.length === 0 ? (
            <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
              No medications.
            </Typography>
          ) : (
            <TableContainer component={Paper} variant="outlined">
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 600 }}>Medication</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Dose</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}>Frequency</TableCell>
                    <TableCell sx={{ fontWeight: 600 }}></TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {medList.map((m, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{m.name}</TableCell>
                      <TableCell>{m.dose}</TableCell>
                      <TableCell>{m.frequency}</TableCell>
                      <TableCell sx={{ width: 50 }}>
                        <IconButton size="small" onClick={() => handleRemoveMed(idx)} aria-label="remove">
                          <Delete fontSize="small" sx={{ color: '#d32f2f' }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={closeManage}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ backgroundColor: '#003D82' }}
          >
            {loading ? <CircularProgress size={20} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  )
}

export default SummaryTab
