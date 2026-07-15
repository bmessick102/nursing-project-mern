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

interface InstructorCommentDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (content: string) => Promise<void> | void
  loading?: boolean
}

const InstructorCommentDialog: React.FC<InstructorCommentDialogProps> = ({
  open,
  onClose,
  onSubmit,
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
      <DialogTitle>Add Instructor Comment</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" sx={{ color: '#666' }}>
            Your comment is added as read-only instructor feedback on this student note, signed under your name.
          </Typography>
        </Box>
        <TextField
          label="Comment"
          placeholder="e.g., Good assessment — consider documenting pain reassessment."
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
          {loading ? <CircularProgress size={20} /> : 'Add Comment'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default InstructorCommentDialog
