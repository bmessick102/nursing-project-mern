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
  FormControlLabel,
  Switch,
  Alert,
} from '@mui/material'

type Role = 'student' | 'instructor' | 'administrator'

interface TargetAccount {
  _id: string
  username: string
  role: string
  firstName?: string
  lastName?: string
  email?: string
  active?: boolean
}

interface EditAccountDialogProps {
  open: boolean
  loading?: boolean
  account: TargetAccount | null
  isSelf: boolean
  onClose: () => void
  onSubmit: (patch: {
    role?: Role
    active?: boolean
    firstName?: string
    lastName?: string
    email?: string
  }) => Promise<void> | void
}

const EditAccountDialog: React.FC<EditAccountDialogProps> = ({
  open,
  loading,
  account,
  isSelf,
  onClose,
  onSubmit,
}) => {
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [role, setRole] = useState<Role>('student')
  const [active, setActive] = useState(true)

  useEffect(() => {
    if (open && account) {
      setFirstName(account.firstName || '')
      setLastName(account.lastName || '')
      setEmail(account.email || '')
      const normalizedRole: Role =
        account.role === 'administrator' || account.role === 'admin'
          ? 'administrator'
          : account.role === 'instructor'
          ? 'instructor'
          : 'student'
      setRole(normalizedRole)
      setActive(account.active !== false)
    }
  }, [open, account])

  if (!account) return null

  const handleSubmit = async () => {
    if (loading) return
    await onSubmit({
      role,
      active,
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
    })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Edit Account — {account.username}</DialogTitle>
      <DialogContent>
        {isSelf && (
          <Alert severity="info" sx={{ mb: 2 }}>
            This is your own account. Role and Active controls are locked to prevent
            self-lockout.
          </Alert>
        )}
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
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth size="small" disabled={isSelf}>
              <InputLabel id="admin-edit-account-role">Role</InputLabel>
              <Select
                labelId="admin-edit-account-role"
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
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Switch
                  checked={active}
                  onChange={(e) => setActive(e.target.checked)}
                  disabled={isSelf}
                  color="success"
                />
              }
              label={active ? 'Active' : 'Inactive (login blocked)'}
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
          disabled={loading}
          sx={{ backgroundColor: '#003D82' }}
        >
          {loading ? <CircularProgress size={20} /> : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default EditAccountDialog
