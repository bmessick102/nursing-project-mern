import React, { useEffect, useMemo, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Typography,
  Box,
} from '@mui/material'
import SearchableSelect from 'components/common/SearchableSelect'
import { parseTemplateImport } from 'utils/noteTemplateImport'

interface ImportedTemplatePayload {
  name: string
  courseId: string | null
  format: 'freetext'
  content: string
  defaultRole?: string
}

interface NoteTemplateImportDialogProps {
  open: boolean
  loading?: boolean
  courses: { _id: string; name: string; code: string }[]
  allowGlobal: boolean
  onClose: () => void
  onSubmit: (payloads: ImportedTemplatePayload[]) => void
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

const NoteTemplateImportDialog: React.FC<NoteTemplateImportDialogProps> = ({
  open,
  loading,
  courses,
  allowGlobal,
  onClose,
  onSubmit,
}) => {
  const [text, setText] = useState('')
  const [scope, setScope] = useState('')
  const [defaultRole, setDefaultRole] = useState('')

  // Reset all state whenever the dialog opens.
  useEffect(() => {
    if (open) {
      setText('')
      setScope('')
      setDefaultRole('')
    }
  }, [open])

  const parsed = useMemo(() => parseTemplateImport(text), [text])

  const scopeOptions = useMemo(() => {
    const opts = courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))
    return allowGlobal ? [{ value: '', label: 'Global (all courses)' }, ...opts] : opts
  }, [courses, allowGlobal])

  const canSubmit = parsed.length > 0 && !loading

  const handleSubmit = () => {
    if (!canSubmit) return
    const payloads: ImportedTemplatePayload[] = parsed.map((t) => ({
      name: t.name,
      courseId: scope || null,
      format: 'freetext',
      content: t.content,
      defaultRole: defaultRole || undefined,
    }))
    onSubmit(payloads)
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Import Note Templates</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12}>
            <TextField
              label="Paste templates"
              fullWidth
              size="small"
              multiline
              minRows={12}
              value={text}
              onChange={(e) => setText(e.target.value)}
              helperText="Paste one or more templates. Separate multiple templates with a line of dashes (---). Each template's name is its first line."
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
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ color: '#003D82', fontWeight: 700 }}>
              Detected {parsed.length} template{parsed.length === 1 ? '' : 's'}
            </Typography>
            {parsed.length > 0 && (
              <Box component="ul" sx={{ mt: 0.5, mb: 0, pl: 3 }}>
                {parsed.map((t, i) => (
                  <Typography
                    key={i}
                    component="li"
                    variant="body2"
                    sx={{ color: '#595959' }}
                  >
                    {t.name}
                  </Typography>
                ))}
              </Box>
            )}
          </Grid>
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
          {loading ? <CircularProgress size={20} /> : `Import ${parsed.length || ''}`.trim()}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default NoteTemplateImportDialog
