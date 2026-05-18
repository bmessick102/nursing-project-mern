import React, { useState, useEffect } from 'react'
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
} from '@mui/material'

type Role = 'student' | 'instructor' | 'administrator'

interface CreateAccountDialogProps {
  open: boolean
  loading?: boolean
  onClose: () => void
  onSubmit: (payload: {
    username: string
    password: string
    role: Role
    firstName?: string
    lastName?: string
    email?: string
  }) => Promise<void> | void
}

const CreateAccountDialog: React.FC<CreateAccountDialogProps> = ({
  open,
  loading,
  onClose,
  onSubmit,
}) => {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('student')

  useEffect(() => {
    if (open) {
      setUsername('')
      setPassword('')
      setFirstName('')
      setLastName('')
      setEmail('')
      setRole('student')
    }
  }, [open])

  const emailIsValid = email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const canSubmit =
    !!username.trim() &&
    username.trim().length >= 3 &&
    !!password &&
    password.length >= 12 &&
    emailIsValid &&
    !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit({
      username: username.trim(),
      password,
      role,
      firstName: firstName.trim() || undefined,
      lastName: lastName.trim() || undefined,
      email: email.trim() || undefined,
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Create Account</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={12} sm={6}>
            <TextField
              label="First Name"
              fullWidth
              size="small"
              value={firstName}
              onChange={(e) => setFirstName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Last Name"
              fullWidth
              size="small"
              value={lastName}
              onChange={(e) => setLastName(e.target.value)}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Email"
              type="email"
              fullWidth
              size="small"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={!emailIsValid}
              helperText={!emailIsValid ? 'Invalid email format' : ' '}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label="Username"
              fullWidth
              size="small"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              helperText="3+ characters"
              required
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small">
              <InputLabel id="admin-create-account-role">Role</InputLabel>
              <Select
                labelId="admin-create-account-role"
                label="Role"
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
              >
                <MenuItem value="student">Student</MenuItem>
                <MenuItem value="instructor">Instructor</MenuItem>
                <MenuItem value="administrator">Administrator</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Password"
              type="password"
              fullWidth
              size="small"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              helperText="12+ characters required"
              required
            />
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
          {loading ? <CircularProgress size={20} /> : 'Create Account'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default CreateAccountDialog
