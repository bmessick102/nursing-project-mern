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
  Chip,
  Stack,
  Typography,
  Autocomplete,
  Checkbox,
  FormControlLabel,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import type { Course } from '@types'
import { ALLERGENS, DIAGNOSES } from 'data/clinicalReference'
import SearchableSelect from 'components/common/SearchableSelect'

interface CreatePatientPayload {
  courseId: string
  name: string
  age: number
  gender: string
  roomNumber: string
  diagnosis: string[]
  allergies: string[]
  medications?: { name: string; dose: string; frequency: string }[]
  isCaseStudy?: boolean
  availableFrom?: string
  availableUntil?: string
  relativeDateOffsetDays?: number
}

interface CreatePatientDialogProps {
  open: boolean
  loading?: boolean
  courses: Course[]
  defaultCourseId?: string | null
  onClose: () => void
  onSubmit: (payload: CreatePatientPayload) => Promise<void> | void
}

const CreatePatientDialog: React.FC<CreatePatientDialogProps> = ({
  open,
  loading,
  courses,
  defaultCourseId,
  onClose,
  onSubmit,
}) => {
  const [courseId, setCourseId] = useState<string>(defaultCourseId || courses[0]?._id || '')
  const [name, setName] = useState('')
  const [age, setAge] = useState('')
  const [gender, setGender] = useState('Female')
  const [roomNumber, setRoomNumber] = useState('')
  const [diagnosis, setDiagnosis] = useState<string[]>([])
  const [diagnosisInput, setDiagnosisInput] = useState('')
  const [allergies, setAllergies] = useState<string[]>([])
  const [allergyInput, setAllergyInput] = useState('')
  const [isCaseStudy, setIsCaseStudy] = useState(true)
  const [availableFrom, setAvailableFrom] = useState(() => new Date().toISOString().slice(0, 10))
  const [availableUntil, setAvailableUntil] = useState('')
  const [relativeDateOffsetDays, setRelativeDateOffsetDays] = useState(2)

  React.useEffect(() => {
    if (open) {
      setCourseId(defaultCourseId || courses[0]?._id || '')
      setName('')
      setAge('')
      setGender('Female')
      setRoomNumber('')
      setDiagnosis([])
      setDiagnosisInput('')
      setAllergies([])
      setAllergyInput('')
      setIsCaseStudy(true)
      setAvailableFrom(new Date().toISOString().slice(0, 10))
      setAvailableUntil('')
      setRelativeDateOffsetDays(2)
    }
  }, [open, defaultCourseId, courses])

  const canSubmit = !!courseId && !!name.trim() && !loading

  const addToList = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    setInput: React.Dispatch<React.SetStateAction<string>>,
    current: string[],
  ) => {
    const v = value.trim()
    if (!v) return
    if (current.some((x) => x.toLowerCase() === v.toLowerCase())) {
      setInput('')
      return
    }
    setter([...current, v])
    setInput('')
  }

  const removeFromList = (
    idx: number,
    setter: React.Dispatch<React.SetStateAction<string[]>>,
    current: string[],
  ) => {
    setter(current.filter((_, i) => i !== idx))
  }

  const handleSubmit = async () => {
    if (!canSubmit) return
    if (isCaseStudy && availableUntil && availableUntil < availableFrom) {
      alert('The "Available until" date cannot be before the "Available from" date.')
      return
    }
    await onSubmit({
      courseId,
      name: name.trim(),
      age: parseInt(age) || 0,
      gender,
      roomNumber: roomNumber.trim(),
      diagnosis,
      allergies,
      isCaseStudy,
      availableFrom: isCaseStudy ? availableFrom : undefined,
      availableUntil: isCaseStudy && availableUntil ? availableUntil : undefined,
      relativeDateOffsetDays: isCaseStudy ? relativeDateOffsetDays : undefined,
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Patient</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <SearchableSelect
              label="Assign to Course"
              placeholder="Search courses…"
              value={courseId}
              onChange={setCourseId}
              required
              options={courses.map((c) => ({ value: c._id, label: `${c.name} (${c.code})` }))}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Patient Name"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <TextField
              label="Age"
              type="number"
              fullWidth
              size="small"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              inputProps={{ min: 0, max: 130, inputMode: 'numeric' }}
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <SearchableSelect
              label="Gender"
              value={gender}
              onChange={setGender}
              options={['Female', 'Male', 'Nonbinary', 'Other']}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Room Number"
              fullWidth
              size="small"
              value={roomNumber}
              onChange={(e) => setRoomNumber(e.target.value)}
            />
          </Grid>

          <Grid item xs={12}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={isCaseStudy}
                  onChange={(e) => setIsCaseStudy(e.target.checked)}
                />
              }
              label="Scheduled case study (release to students during a date window)"
            />
            {isCaseStudy && (
              <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                <TextField
                  label="Available from"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={availableFrom}
                  onChange={(e) => setAvailableFrom(e.target.value)}
                />
                <TextField
                  label="Available until (optional)"
                  type="date"
                  fullWidth
                  size="small"
                  InputLabelProps={{ shrink: true }}
                  value={availableUntil}
                  onChange={(e) => setAvailableUntil(e.target.value)}
                  inputProps={{ min: availableFrom }}
                />
                <TextField
                  label="Most recent entry = N days before student opens"
                  type="number"
                  fullWidth
                  size="small"
                  helperText="e.g. 2 = last note dated two days before the student starts"
                  value={relativeDateOffsetDays}
                  onChange={(e) => {
                    const parsed = parseInt(e.target.value, 10)
                    setRelativeDateOffsetDays(Number.isNaN(parsed) ? relativeDateOffsetDays : parsed)
                  }}
                  inputProps={{ min: 0, max: 60 }}
                />
              </Stack>
            )}
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#595959', fontWeight: 600 }}>
              Diagnoses
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
              <Autocomplete
                freeSolo
                fullWidth
                options={DIAGNOSES.filter((d) => !diagnosis.includes(d))}
                inputValue={diagnosisInput}
                onInputChange={(_, v, reason) => {
                  if (reason !== 'reset') setDiagnosisInput(v)
                }}
                onChange={(_, v) => {
                  if (typeof v === 'string')
                    addToList(v, setDiagnosis, setDiagnosisInput, diagnosis)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or type a diagnosis…"
                    size="small"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && diagnosisInput.trim()) {
                        e.preventDefault()
                        addToList(diagnosisInput, setDiagnosis, setDiagnosisInput, diagnosis)
                      }
                    }}
                  />
                )}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => addToList(diagnosisInput, setDiagnosis, setDiagnosisInput, diagnosis)}
              >
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {diagnosis.map((d, idx) => (
                <Chip
                  key={idx}
                  label={d}
                  onDelete={() => removeFromList(idx, setDiagnosis, diagnosis)}
                  sx={{ color: '#003D82', borderColor: '#003D82', fontWeight: 600 }}
                  variant="outlined"
                />
              ))}
            </Stack>
          </Grid>

          <Grid item xs={12}>
            <Typography variant="caption" sx={{ color: '#595959', fontWeight: 600 }}>
              Allergies
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
              <Autocomplete
                freeSolo
                fullWidth
                options={ALLERGENS.filter((a) => !allergies.includes(a))}
                inputValue={allergyInput}
                onInputChange={(_, v, reason) => {
                  if (reason !== 'reset') setAllergyInput(v)
                }}
                onChange={(_, v) => {
                  if (typeof v === 'string')
                    addToList(v, setAllergies, setAllergyInput, allergies)
                }}
                renderInput={(params) => (
                  <TextField
                    {...params}
                    placeholder="Search or type an allergy…"
                    size="small"
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && allergyInput.trim()) {
                        e.preventDefault()
                        addToList(allergyInput, setAllergies, setAllergyInput, allergies)
                      }
                    }}
                  />
                )}
              />
              <Button
                variant="outlined"
                startIcon={<Add />}
                onClick={() => addToList(allergyInput, setAllergies, setAllergyInput, allergies)}
              >
                Add
              </Button>
            </Stack>
            <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
              {allergies.map((a, idx) => (
                <Chip
                  key={idx}
                  label={a}
                  onDelete={() => removeFromList(idx, setAllergies, allergies)}
                  sx={{ color: '#B71C1C', borderColor: '#B71C1C', fontWeight: 600 }}
                  variant="outlined"
                />
              ))}
            </Stack>
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
          {loading ? <CircularProgress size={20} /> : 'Create Patient'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreatePatientDialog
