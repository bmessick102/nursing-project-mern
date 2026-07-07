import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  TextField,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Grid,
  Paper,
  Switch,
  FormControlLabel,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import SearchableSelect from 'components/common/SearchableSelect'
import type { BradenScore, NursingAssessment, Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'

const SUB_OPTIONS = [
  { value: 1, label: '1 — Severe deficit' },
  { value: 2, label: '2 — Major deficit' },
  { value: 3, label: '3 — Slight deficit' },
  { value: 4, label: '4 — No impairment' },
]

const FRICTION_OPTIONS = [
  { value: 1, label: '1 — Problem' },
  { value: 2, label: '2 — Potential problem' },
  { value: 3, label: '3 — No apparent problem' },
]

const computeRiskLevel = (total: number): BradenScore['riskLevel'] => {
  if (total >= 19) return 'no risk'
  if (total >= 15) return 'mild'
  if (total >= 13) return 'moderate'
  if (total >= 10) return 'high'
  return 'severe'
}

const riskColor = (risk: BradenScore['riskLevel']) => {
  switch (risk) {
    case 'no risk':
      return 'success'
    case 'mild':
      return 'info'
    case 'moderate':
      return 'warning'
    case 'high':
    case 'severe':
      return 'error'
  }
}

interface Props {
  patient: Patient
  onSaved?: (p: Patient) => void
}

const SkinIntegrityAssessment: React.FC<Props> = ({ patient, onSaved }) => {
  const [wdl, setWdl] = useState(true)
  const [skinColor, setSkinColor] = useState('Pink, warm, dry')
  const [turgor, setTurgor] = useState('Elastic')
  const [wounds, setWounds] = useState('None')
  const [woundLocation, setWoundLocation] = useState('')
  const [narrative, setNarrative] = useState('')

  const [braden, setBraden] = useState({
    sensoryPerception: 4,
    moisture: 4,
    activity: 3,
    mobility: 3,
    nutrition: 3,
    frictionShear: 3,
  })
  const total =
    braden.sensoryPerception +
    braden.moisture +
    braden.activity +
    braden.mobility +
    braden.nutrition +
    braden.frictionShear
  const risk = computeRiskLevel(total)

  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { addAssessment, addBradenScore, loading } = useChartingApi()
  const { username } = useCurrentUser()

  const lastBraden = [...(patient.bradenScores || [])].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )[0]

  const handleSave = async () => {
    try {
      const ts = new Date().toISOString()
      const assessmentPayload: Omit<NursingAssessment, '_id'> = {
        timestamp: ts,
        system: 'skin',
        wdl,
        findings: {
          skinColor,
          turgor,
          wounds,
          woundLocation,
          bradenTotal: total,
          bradenRisk: risk,
        },
        narrative: narrative.trim() || undefined,
        documentedBy: username,
        signed: true,
      }
      const bradenPayload: Omit<BradenScore, '_id'> = {
        timestamp: ts,
        ...braden,
        total,
        riskLevel: risk,
        documentedBy: username,
      }
      await addAssessment(patient._id, assessmentPayload)
      const updated = await addBradenScore(patient._id, bradenPayload)
      setSavedAt(new Date().toLocaleTimeString())
      setNarrative('')
      onSaved?.(updated)
    } catch (err) {
      console.error('Failed to save skin assessment', err)
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          Skin / Integumentary + Braden Scale
        </Typography>
        {lastBraden && (
          <Chip
            size="small"
            color={riskColor(lastBraden.riskLevel)}
            variant="outlined"
            label={`Last Braden: ${lastBraden.total} (${lastBraden.riskLevel})`}
          />
        )}
      </Stack>

      <FormControlLabel
        control={
          <Switch
            checked={wdl}
            onChange={(e) => setWdl(e.target.checked)}
            color="success"
          />
        }
        label={wdl ? 'Skin Within Defined Limits' : 'Skin abnormality present'}
      />

      <Divider sx={{ my: 2 }} />

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="Color / Temperature"
            value={skinColor}
            onChange={setSkinColor}
            freeSolo
            options={[
              'Pink, warm, dry',
              'Pale',
              'Cyanotic',
              'Jaundiced',
              'Flushed',
              'Mottled',
              'Diaphoretic',
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="Turgor"
            value={turgor}
            onChange={setTurgor}
            options={['Elastic', 'Tenting present', 'Decreased']}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <SearchableSelect
            label="Wounds / Pressure Injuries"
            value={wounds}
            onChange={setWounds}
            freeSolo
            options={[
              'None',
              'Stage 1 pressure injury',
              'Stage 2 pressure injury',
              'Stage 3 pressure injury',
              'Stage 4 pressure injury',
              'Unstageable',
              'Surgical incision',
              'Laceration',
              'Rash',
            ]}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            label="Wound Location (if any)"
            fullWidth
            size="small"
            value={woundLocation}
            onChange={(e) => setWoundLocation(e.target.value)}
            disabled={wounds === 'None'}
          />
        </Grid>
      </Grid>

      <Paper variant="outlined" sx={{ p: 2, mt: 3, backgroundColor: '#fafafa' }}>
        <Stack direction="row" alignItems="center" justifyContent="space-between" mb={1}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
            Braden Scale (Pressure Injury Risk)
          </Typography>
          <Chip
            label={`Total: ${total} — ${risk.toUpperCase()}`}
            color={riskColor(risk)}
            size="small"
          />
        </Stack>

        <Grid container spacing={2}>
          {(
            [
              ['sensoryPerception', 'Sensory Perception'],
              ['moisture', 'Moisture'],
              ['activity', 'Activity'],
              ['mobility', 'Mobility'],
              ['nutrition', 'Nutrition'],
            ] as const
          ).map(([key, label]) => (
            <Grid item xs={12} sm={6} key={key}>
              <SearchableSelect
                label={label}
                value={String(braden[key])}
                onChange={(v) => setBraden({ ...braden, [key]: Number(v) })}
                options={SUB_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
              />
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <SearchableSelect
              label="Friction / Shear"
              value={String(braden.frictionShear)}
              onChange={(v) => setBraden({ ...braden, frictionShear: Number(v) })}
              options={FRICTION_OPTIONS.map((o) => ({ value: String(o.value), label: o.label }))}
            />
          </Grid>
        </Grid>
      </Paper>

      <TextField
        label="Narrative / nursing note"
        multiline
        minRows={2}
        fullWidth
        value={narrative}
        onChange={(e) => setNarrative(e.target.value)}
        sx={{ mt: 3 }}
      />

      <Stack direction="row" spacing={2} alignItems="center" sx={{ mt: 2 }}>
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

export default SkinIntegrityAssessment
