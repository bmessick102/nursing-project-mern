import React from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  CircularProgress,
  Alert,
} from '@mui/material'

interface RegenerateCodeDialogProps {
  open: boolean
  loading?: boolean
  courseName?: string
  currentCode?: string
  onClose: () => void
  onConfirm: () => Promise<void> | void
}

const RegenerateCodeDialog: React.FC<RegenerateCodeDialogProps> = ({
  open,
  loading,
  courseName,
  currentCode,
  onClose,
  onConfirm,
}) => {
  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="xs" fullWidth>
      <DialogTitle>Regenerate Course Code</DialogTitle>
      <DialogContent>
        <Alert severity="warning" sx={{ mb: 2 }}>
          The old code stops working immediately. Students already enrolled keep
          their access; only future joins will need the new code.
        </Alert>
        <Typography variant="body2">
          Regenerate the join code for <strong>{courseName}</strong>?
        </Typography>
        {currentCode && (
          <Typography
            variant="body2"
            sx={{
              mt: 1,
              fontFamily: 'Source Code Pro, Menlo, Consolas, monospace',
              color: '#595959',
            }}
          >
            Current: {currentCode}
          </Typography>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancel
        </Button>
        <Button
          variant="contained"
          color="warning"
          onClick={onConfirm}
          disabled={loading}
        >
          {loading ? <CircularProgress size={20} /> : 'Regenerate'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default RegenerateCodeDialog
