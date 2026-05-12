import React, { useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'

interface MarkInErrorDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (reason: string) => Promise<void> | void
  entityLabel?: string
  loading?: boolean
}

const MarkInErrorDialog: React.FC<MarkInErrorDialogProps> = ({
  open,
  onClose,
  onSubmit,
  entityLabel = 'entry',
  loading,
}) => {
  const [reason, setReason] = useState('')

  const handleClose = () => {
    if (!loading) {
      setReason('')
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!reason.trim()) return
    await onSubmit(reason.trim())
    setReason('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle sx={{ color: '#d32f2f' }}>Mark {entityLabel} as Documented in Error</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          The {entityLabel} will be preserved in the chart with a strikethrough and "DOCUMENTED IN ERROR" banner. It cannot be deleted. Provide a clear, factual reason.
        </Alert>
        <Typography variant="caption" sx={{ color: '#666', display: 'block', mb: 1 }}>
          Examples: "Wrong patient — should have been documented on Room 305"; "Duplicate entry"; "Wrong medication selected".
        </Typography>
        <TextField
          label="Reason"
          placeholder="Required"
          multiline
          minRows={2}
          fullWidth
          autoFocus
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={handleSubmit}
          disabled={!reason.trim() || loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Confirm Mark in Error'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default MarkInErrorDialog
