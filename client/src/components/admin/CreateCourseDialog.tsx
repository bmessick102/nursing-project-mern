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
  InputAdornment,
  IconButton,
  Tooltip,
} from '@mui/material'
import { Casino } from '@mui/icons-material'

// Unambiguous alphabet (no 0/1/I/O) matching the server's join-code style. Math.random is
// fine here — this is a convenience default; uniqueness is enforced server-side and the
// student join code is crypto-random regardless.
const CODE_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ'
const randomCourseCode = (): string => {
  let tail = ''
  for (let i = 0; i < 4; i++) tail += CODE_ALPHABET[Math.floor(Math.random() * CODE_ALPHABET.length)]
  return `CRSE${tail}`
}

interface CreateCourseDialogProps {
  open: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: {
    name: string
    code: string
    instructor: string
    description: string
  }) => Promise<void> | void
}

const CreateCourseDialog: React.FC<CreateCourseDialogProps> = ({
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const [name, setName] = useState('')
  const [code, setCode] = useState('')
  const [instructor, setInstructor] = useState('')
  const [description, setDescription] = useState('')

  const canSubmit = !!name.trim() && !!code.trim() && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit({
      name: name.trim(),
      code: code.trim().toUpperCase(),
      instructor: instructor.trim(),
      description: description.trim(),
    })
    setName('')
    setCode('')
    setInstructor('')
    setDescription('')
  }

  const handleClose = () => {
    if (loading) return
    onClose()
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Course</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={8}>
            <TextField
              label="Course Name"
              placeholder="e.g., Adult Health Nursing"
              fullWidth
              size="small"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <TextField
              label="Course Code"
              placeholder="e.g., NURS401"
              fullWidth
              size="small"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              inputProps={{ style: { textTransform: 'uppercase' } }}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Tooltip title="Generate a random code">
                      <IconButton
                        edge="end"
                        size="small"
                        onClick={() => setCode(randomCourseCode())}
                        aria-label="generate random course code"
                      >
                        <Casino fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
                ),
              }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Instructor"
              placeholder="Dr. Jane Smith"
              fullWidth
              size="small"
              value={instructor}
              onChange={(e) => setInstructor(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Description"
              placeholder="Short course description for the catalog"
              multiline
              minRows={2}
              fullWidth
              size="small"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit}
          sx={{ backgroundColor: '#003D82' }}
        >
          {loading ? <CircularProgress size={20} /> : 'Create Course'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateCourseDialog
