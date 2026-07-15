import React, { useState } from 'react'
import {
  Box,
  Typography,
  Slider,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import SearchableSelect from 'components/common/SearchableSelect'
import type { NursingAssessment, Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'

const FACES_LABELS: Record<number, string> = {
  0: 'No hurt',
  2: 'Hurts a little',
  4: 'Hurts a little more',
  6: 'Hurts even more',
  8: 'Hurts a lot',
  10: 'Hurts worst',
}

interface Props {
  patient: Patient
  onSaved?: (p: Patient) => void
}

const PainAssessment: React.FC<Props> = ({ patient, onSaved }) => {
  const [score, setScore] = useState(0)
  const [provocation, setProvocation] = useState('')
  const [quality, setQuality] = useState('')
  const [region, setRegion] = useState('')
  const [severity, setSeverity] = useState('Mild')
  const [timing, setTiming] = useState('Intermittent')
  const [intervention, setIntervention] = useState('None this shift')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { addAssessment, loading } = useChartingApi()
  const { username } = useCurrentUser()

  const lastPain = [...(patient.assessments || [])]
    .filter((a) => a.system === 'pain')
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]

  const handleSave = async () => {
    try {
      const payload: Omit<NursingAssessment, '_id'> = {
        timestamp: new Date().toISOString(),
        system: 'pain',
        wdl: score === 0,
        findings: {
          score,
          provocation,
          quality,
          region,
          severity,
          timing,
          intervention,
        },
        narrative: `PQRST — P: ${provocation || 'n/a'}, Q: ${quality || 'n/a'}, R: ${region || 'n/a'}, S: ${score}/10 ${severity}, T: ${timing}. Intervention: ${intervention}.`,
        documentedBy: username,
        signed: true,
      }
      const updated = await addAssessment(patient._id, payload)
      setSavedAt(new Date().toLocaleTimeString())
      setScore(0)
      setProvocation('')
      setQuality('')
      setRegion('')
      setSeverity('Mild')
      setTiming('Intermittent')
      setIntervention('None this shift')
      onSaved?.(updated)
    } catch (err) {
      console.error('Failed to save pain assessment', err)
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Pain Assessment (PQRST)
        </Typography>
        {lastPain && typeof lastPain.findings.score === 'number' && (
          <Chip
            size="small"
            color={lastPain.findings.score === 0 ? 'success' : 'warning'}
            variant="outlined"
            label={`Last pain: ${lastPain.findings.score}/10 at ${new Date(lastPain.timestamp).toLocaleString()}`}
          />
        )}
      </Stack>

      <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
        Numeric Pain Scale (0–10) — FACES: {FACES_LABELS[Math.round(score / 2) * 2] || ''}
      </Typography>
      <Slider
        value={score}
        onChange={(_, v) => setScore(v as number)}
        min={0}
        max={10}
        step={1}
        aria-label="Pain score, 0 to 10"
        aria-valuetext={`${score} out of 10${
          FACES_LABELS[Math.round(score / 2) * 2]
            ? ', ' + FACES_LABELS[Math.round(score / 2) * 2]
            : ''
        }`}
        marks={[
          { value: 0, label: '0' },
          { value: 2, label: '2' },
          { value: 4, label: '4' },
          { value: 6, label: '6' },
          { value: 8, label: '8' },
          { value: 10, label: '10' },
        ]}
        sx={{
          color: score === 0 ? '#2e7d32' : score >= 7 ? '#d32f2f' : '#ed6c02',
        }}
      />

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            label="P — Provocation / Palliation"
            placeholder="What makes it worse / better?"
            fullWidth
            size="small"
            value={provocation}
            onChange={(e) => setProvocation(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Q — Quality"
            placeholder="Sharp, dull, burning, throbbing..."
            fullWidth
            size="small"
            value={quality}
            onChange={(e) => setQuality(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="R — Region / Radiation"
            placeholder="Where? Does it radiate?"
            fullWidth
            size="small"
            value={region}
            onChange={(e) => setRegion(e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="S — Severity"
            value={severity}
            onChange={setSeverity}
            options={['None', 'Mild', 'Moderate', 'Severe', 'Excruciating']}
            freeSolo
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="T — Timing"
            value={timing}
            onChange={setTiming}
            freeSolo
            options={['Constant', 'Intermittent', 'With movement', 'Post-procedure']}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="Intervention"
            value={intervention}
            onChange={setIntervention}
            freeSolo
            options={[
              'None this shift',
              'Repositioning',
              'Heat / cold',
              'PO analgesic',
              'IV analgesic',
              'Notified provider',
            ]}
          />
        </Grid>
      </Grid>

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 3 }}>
        <Button
          variant="contained"
          onClick={handleSave}
          disabled={loading}
          sx={{ backgroundColor: '#003D82' }}
        >
          {loading ? <CircularProgress size={20} /> : 'Sign & Save'}
        </Button>
        {savedAt && (
          <Chip
            icon={<CheckCircle />}
            size="small"
            color="success"
            label={`Saved at ${savedAt}`}
          />
        )}
      </Stack>
    </Box>
  )
}

export default PainAssessment
