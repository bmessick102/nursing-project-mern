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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Stack,
  Typography,
} from '@mui/material'
import { Add } from '@mui/icons-material'
import type { Course } from '@types'

interface CreatePatientPayload {
  courseId: string
  name: string
  age: number
  gender: string
  roomNumber: string
  diagnosis: string[]
  allergies: string[]
  medications?: { name: string; dose: string; frequency: string }[]
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
    await onSubmit({
      courseId,
      name: name.trim(),
      age: parseInt(age) || 0,
      gender,
      roomNumber: roomNumber.trim(),
      diagnosis,
      allergies,
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="md" fullWidth>
      <DialogTitle>Add Patient</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-create-patient-course">Assign to Course</InputLabel>
              <Select
                labelId="admin-create-patient-course"
                label="Assign to Course"
                value={courseId}
                onChange={(e) => setCourseId(e.target.value as string)}
              >
                {courses.map((c) => (
                  <MenuItem key={c._id} value={c._id}>
                    {c.name} ({c.code})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
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
            />
          </Grid>
          <Grid item xs={6} sm={3}>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-create-patient-gender">Gender</InputLabel>
              <Select
                labelId="admin-create-patient-gender"
                label="Gender"
                value={gender}
                onChange={(e) => setGender(e.target.value as string)}
              >
                <MenuItem value="Female">Female</MenuItem>
                <MenuItem value="Male">Male</MenuItem>
                <MenuItem value="Nonbinary">Nonbinary</MenuItem>
                <MenuItem value="Other">Other</MenuItem>
              </Select>
            </FormControl>
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
            <Typography variant="caption" sx={{ color: '#595959', fontWeight: 600 }}>
              Diagnoses
            </Typography>
            <Stack direction="row" spacing={1} sx={{ mt: 1, mb: 1 }}>
              <TextField
                placeholder="e.g., Type 2 Diabetes"
                fullWidth
                size="small"
                value={diagnosisInput}
                onChange={(e) => setDiagnosisInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToList(diagnosisInput, setDiagnosis, setDiagnosisInput, diagnosis)
                  }
                }}
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
              <TextField
                placeholder="e.g., Penicillin"
                fullWidth
                size="small"
                value={allergyInput}
                onChange={(e) => setAllergyInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    addToList(allergyInput, setAllergies, setAllergyInput, allergies)
                  }
                }}
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
