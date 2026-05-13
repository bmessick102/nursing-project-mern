import React, { useState } from 'react'
import {
  Box,
  Typography,
  Stack,
  Select,
  MenuItem,
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
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            Color / Temperature
          </Typography>
          <Select
            fullWidth
            size="small"
            value={skinColor}
            onChange={(e) => setSkinColor(e.target.value)}
              aria-label="Color / Temperature"
          >
            <MenuItem value="Pink, warm, dry">Pink, warm, dry</MenuItem>
            <MenuItem value="Pale">Pale</MenuItem>
            <MenuItem value="Cyanotic">Cyanotic</MenuItem>
            <MenuItem value="Jaundiced">Jaundiced</MenuItem>
            <MenuItem value="Flushed">Flushed</MenuItem>
            <MenuItem value="Mottled">Mottled</MenuItem>
            <MenuItem value="Diaphoretic">Diaphoretic</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            Turgor
          </Typography>
          <Select
            fullWidth
            size="small"
            value={turgor}
            onChange={(e) => setTurgor(e.target.value)}
              aria-label="Turgor"
          >
            <MenuItem value="Elastic">Elastic</MenuItem>
            <MenuItem value="Tenting present">Tenting present</MenuItem>
            <MenuItem value="Decreased">Decreased</MenuItem>
          </Select>
        </Grid>
        <Grid item xs={12} sm={6}>
          <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
            Wounds / Pressure Injuries
          </Typography>
          <Select
            fullWidth
            size="small"
            value={wounds}
            onChange={(e) => setWounds(e.target.value)}
              aria-label="Wounds / Pressure Injuries"
          >
            <MenuItem value="None">None</MenuItem>
            <MenuItem value="Stage 1 pressure injury">Stage 1 pressure injury</MenuItem>
            <MenuItem value="Stage 2 pressure injury">Stage 2 pressure injury</MenuItem>
            <MenuItem value="Stage 3 pressure injury">Stage 3 pressure injury</MenuItem>
            <MenuItem value="Stage 4 pressure injury">Stage 4 pressure injury</MenuItem>
            <MenuItem value="Unstageable">Unstageable</MenuItem>
            <MenuItem value="Surgical incision">Surgical incision</MenuItem>
            <MenuItem value="Laceration">Laceration</MenuItem>
            <MenuItem value="Rash">Rash</MenuItem>
          </Select>
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
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                {label}
              </Typography>
              <Select
                fullWidth
                size="small"
                value={braden[key]}
                onChange={(e) =>
                  setBraden({ ...braden, [key]: Number(e.target.value) })
                }
              >
                {SUB_OPTIONS.map((o) => (
                  <MenuItem key={o.value} value={o.value}>
                    {o.label}
                  </MenuItem>
                ))}
              </Select>
            </Grid>
          ))}
          <Grid item xs={12} sm={6}>
            <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
              Friction / Shear
            </Typography>
            <Select
              fullWidth
              size="small"
              value={braden.frictionShear}
              aria-label="Friction / Shear"
              onChange={(e) => setBraden({ ...braden, frictionShear: Number(e.target.value) })}
            >
              {FRICTION_OPTIONS.map((o) => (
                <MenuItem key={o.value} value={o.value}>
                  {o.label}
                </MenuItem>
              ))}
            </Select>
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
