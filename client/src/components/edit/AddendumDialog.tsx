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
  Box,
} from '@mui/material'

interface AddendumDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (content: string) => Promise<void> | void
  entityLabel?: string
  loading?: boolean
}

const AddendumDialog: React.FC<AddendumDialogProps> = ({
  open,
  onClose,
  onSubmit,
  entityLabel = 'item',
  loading,
}) => {
  const [content, setContent] = useState('')

  const handleClose = () => {
    if (!loading) {
      setContent('')
      onClose()
    }
  }

  const handleSubmit = async () => {
    if (!content.trim()) return
    await onSubmit(content.trim())
    setContent('')
  }

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Add Addendum</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            The signed {entityLabel} cannot be edited. Your addendum is appended as a dated comment and signed under your name.
          </Typography>
        </Box>
        <TextField
          label="Addendum text"
          placeholder="e.g., Pt also reports nausea after lunch."
          multiline
          minRows={3}
          fullWidth
          autoFocus
          value={content}
          onChange={(e) => setContent(e.target.value)}
          disabled={loading}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!content.trim() || loading}
          sx={{ backgroundColor: '#003D82' }}
        >
          {loading ? <CircularProgress size={20} /> : 'Sign & Append'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AddendumDialog
