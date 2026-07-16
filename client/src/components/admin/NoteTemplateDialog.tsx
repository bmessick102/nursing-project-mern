import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  ToggleButton,
  ToggleButtonGroup,
  Typography,
} from '@mui/material'
import type { Course, NoteTemplate } from '@types'
import SearchableSelect from 'components/common/SearchableSelect'

interface NoteTemplatePayload {
  name: string
  courseId: string | null
  defaultRole?: string
  defaultType?: string
  format: 'freetext' | 'soap'
  content?: string
  soap?: { subjective?: string; objective?: string; assessment?: string; plan?: string }
}

interface NoteTemplateDialogProps {
  open: boolean
  loading?: boolean
  courses: Course[]
  initial?: NoteTemplate | null
  onClose: () => void
  onSubmit: (payload: NoteTemplatePayload) => Promise<void> | void
}

const ROLE_OPTIONS = [
  'RN',
  'LPN',
  'CNA',
  'Physician (MD)',
  'Nurse Practitioner (NP)',
  'Physician Assistant (PA)',
  'Respiratory Therapist (RT)',
  'Physical Therapist (PT)',
  'Charge Nurse',
  'Provider',
]

const TYPE_OPTIONS = ['Progress Note', 'Assessment', 'Procedure Note', 'Incident Report']

const NoteTemplateDialog: React.FC<NoteTemplateDialogProps> = ({
  open,
  loading,
  courses,
  initial,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [scope, setScope] = useState<string>('')
  const [defaultRole, setDefaultRole] = useState('')
  const [defaultType, setDefaultType] = useState('')
  const [format, setFormat] = useState<'freetext' | 'soap'>('freetext')
  const [content, setContent] = useState('')
  const [subjective, setSubjective] = useState('')
  const [objective, setObjective] = useState('')
  const [assessment, setAssessment] = useState('')
  const [plan, setPlan] = useState('')

  React.useEffect(() => {
    if (open) {
      setName(initial?.name || '')
      setScope(initial?.courseId || '')
      setDefaultRole(initial?.defaultRole || '')
      setDefaultType(initial?.defaultType || '')
      setFormat(initial?.format || 'freetext')
      setContent(initial?.content || '')
      setSubjective(initial?.soap?.subjective || '')
      setObjective(initial?.soap?.objective || '')
      setAssessment(initial?.soap?.assessment || '')
      setPlan(initial?.soap?.plan || '')
    }
  }, [open, initial])

  const canSubmit = !!name.trim() && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    const payload: NoteTemplatePayload = {
      name: name.trim(),
      courseId: scope || null,
      defaultRole: defaultRole.trim() || undefined,
      defaultType: defaultType.trim() || undefined,
      format,
    }
    if (format === 'soap') {
      payload.soap = {
        subjective: subjective || undefined,
        objective: objective || undefined,
        assessment: assessment || undefined,
        plan: plan || undefined,
      }
    } else {
      payload.content = content
    }
    await onSubmit(payload)
  }

  const scopeOptions = [
    { value: '', label: 'Global (all courses)' },
    ...courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` })),
  ]

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>{initial ? 'Edit Note Template' : 'New Note Template'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Template Name"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SearchableSelect
              label="Course scope"
              placeholder="Search courses…"
              value={scope}
              onChange={setScope}
              options={scopeOptions}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SearchableSelect
              label="Default provider role"
              placeholder="Select or type a role…"
              value={defaultRole}
              onChange={setDefaultRole}
              freeSolo
              options={ROLE_OPTIONS}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <SearchableSelect
              label="Default note type"
              placeholder="Select or type a type…"
              value={defaultType}
              onChange={setDefaultType}
              freeSolo
              options={TYPE_OPTIONS}
            />
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#595959', fontWeight: 600, display: 'block', mb: 1 }}>
              Format
            </Typography>
            <ToggleButtonGroup
              exclusive
              size="small"
              value={format}
              onChange={(_, v) => {
                if (v) setFormat(v)
              }}
            >
              <ToggleButton value="freetext">Free text</ToggleButton>
              <ToggleButton value="soap">SOAP</ToggleButton>
            </ToggleButtonGroup>
          </Grid>

          {format === 'freetext' ? (
            <Grid item xs={12}>
              <TextField
                label="Content"
                fullWidth
                size="small"
                multiline
                minRows={6}
                value={content}
                onChange={(e) => setContent(e.target.value)}
              />
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Subjective"
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  value={subjective}
                  onChange={(e) => setSubjective(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Objective"
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  value={objective}
                  onChange={(e) => setObjective(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Assessment"
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  value={assessment}
                  onChange={(e) => setAssessment(e.target.value)}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Plan"
                  fullWidth
                  size="small"
                  multiline
                  minRows={4}
                  value={plan}
                  onChange={(e) => setPlan(e.target.value)}
                />
              </Grid>
            </>
          )}
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ backgroundColor: '#003D82' }}
        >
          {loading ? <CircularProgress size={20} /> : initial ? 'Save Changes' : 'Create Template'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NoteTemplateDialog
