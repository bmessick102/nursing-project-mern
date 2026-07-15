import React, { useState } from 'react'
import {
  Box,
  Typography,
  Switch,
  FormControlLabel,
  TextField,
  Checkbox,
  FormGroup,
  Button,
  CircularProgress,
  Chip,
  Divider,
  Stack,
} from '@mui/material'
import { CheckCircle } from '@mui/icons-material'
import SearchableSelect from 'components/common/SearchableSelect'
import type {
  AssessmentSystem,
  NursingAssessment,
  Patient,
} from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'

export type AssessmentField =
  | {
      key: string
      label: string
      kind: 'select'
      options: string[]
      defaultValue?: string
    }
  | {
      key: string
      label: string
      kind: 'text'
      defaultValue?: string
    }
  | {
      key: string
      label: string
      kind: 'checkbox-group'
      options: string[]
    }

export interface AssessmentFormProps {
  patient: Patient
  system: AssessmentSystem
  title: string
  fields: AssessmentField[]
  onSaved?: (updatedPatient: Patient) => void
}

const buildDefaults = (fields: AssessmentField[]): Record<string, string | boolean | number> => {
  const out: Record<string, string | boolean | number> = {}
  fields.forEach((f) => {
    if (f.kind === 'select') out[f.key] = f.defaultValue ?? f.options[0]
    if (f.kind === 'text') out[f.key] = f.defaultValue ?? ''
    if (f.kind === 'checkbox-group') out[f.key] = ''
  })
  return out
}

const AssessmentForm: React.FC<AssessmentFormProps> = ({
  patient,
  system,
  title,
  fields,
  onSaved,
}) => {
  const [wdl, setWdl] = useState(true)
  const [findings, setFindings] = useState<Record<string, string | boolean | number>>(
    buildDefaults(fields),
  )
  const [narrative, setNarrative] = useState('')
  const [savedAt, setSavedAt] = useState<string | null>(null)
  const { addAssessment, loading } = useChartingApi()
  const { username } = useCurrentUser()

  const lastForSystem = [...(patient.assessments || [])]
    .filter((a) => a.system === system)
    .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]

  const handleCheckboxToggle = (fieldKey: string, option: string) => {
    const current = String(findings[fieldKey] || '')
    const set = new Set(current ? current.split(', ').filter(Boolean) : [])
    if (set.has(option)) set.delete(option)
    else set.add(option)
    setFindings({ ...findings, [fieldKey]: Array.from(set).join(', ') })
  }

  const handleSubmit = async () => {
    try {
      const payload: Omit<NursingAssessment, '_id'> = {
        timestamp: new Date().toISOString(),
        system,
        wdl,
        findings,
        narrative: narrative.trim() || undefined,
        documentedBy: username,
        signed: true,
      }
      const updated = await addAssessment(patient._id, payload)
      setSavedAt(new Date().toLocaleTimeString())
      setFindings(buildDefaults(fields))
      setNarrative('')
      setWdl(true)
      onSaved?.(updated)
    } catch (err) {
      console.error('Failed to save assessment', err)
    }
  }

  return (
    <Box>
      <Stack direction="row" alignItems="center" justifyContent="space-between" mb={2}>
        <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
          {title}
        </Typography>
        {lastForSystem && (
          <Chip
            size="small"
            label={`Last documented: ${new Date(lastForSystem.timestamp).toLocaleString()} — ${lastForSystem.wdl ? 'WDL' : 'Abnormal'}`}
            color={lastForSystem.wdl ? 'success' : 'warning'}
            variant="outlined"
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
        label={wdl ? 'Within Defined Limits (WDL)' : 'Abnormal findings present'}
      />

      <Divider sx={{ my: 2 }} />

      <Stack spacing={2}>
        {fields.map((field) => {
          if (field.kind === 'select') {
            return (
              <SearchableSelect
                key={field.key}
                label={field.label}
                value={String(findings[field.key] ?? '')}
                onChange={(v) => setFindings({ ...findings, [field.key]: v })}
                options={field.options}
                freeSolo
              />
            )
          }
          if (field.kind === 'text') {
            return (
              <TextField
                key={field.key}
                label={field.label}
                size="small"
                fullWidth
                value={findings[field.key] ?? ''}
                onChange={(e) =>
                  setFindings({ ...findings, [field.key]: e.target.value })
                }
              />
            )
          }
          return (
            <Box key={field.key}>
              <Typography variant="caption" sx={{ color: '#666', fontWeight: 600 }}>
                {field.label}
              </Typography>
              <FormGroup row>
                {field.options.map((option) => {
                  const current = String(findings[field.key] || '')
                  const checked = current.split(', ').includes(option)
                  return (
                    <FormControlLabel
                      key={option}
                      control={
                        <Checkbox
                          size="small"
                          checked={checked}
                          onChange={() => handleCheckboxToggle(field.key, option)}
                        />
                      }
                      label={option}
                    />
                  )
                })}
              </FormGroup>
            </Box>
          )
        })}

        <TextField
          label="Narrative / nursing note"
          multiline
          minRows={2}
          fullWidth
          value={narrative}
          onChange={(e) => setNarrative(e.target.value)}
        />

        <Stack direction="row" spacing={2} alignItems="center">
          <Button
            variant="contained"
            onClick={handleSubmit}
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
      </Stack>
    </Box>
  )
}

export default AssessmentForm
