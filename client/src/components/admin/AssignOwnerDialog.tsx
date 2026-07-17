import React, { useEffect, useState } from 'react'
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  CircularProgress,
  Box,
} from '@mui/material'
import SearchableSelect from 'components/common/SearchableSelect'

interface AssignOwnerDialogProps {
  open: boolean
  loading?: boolean
  course: { _id: string; name: string; ownerAccountId?: string } | null
  instructorOptions: { value: string; label: string }[]
  onClose: () => void
  onSubmit: (ownerAccountId: string) => void
}

const AssignOwnerDialog: React.FC<AssignOwnerDialogProps> = ({
  open,
  loading,
  course,
  instructorOptions,
  onClose,
  onSubmit,
}) => {
  const [ownerAccountId, setOwnerAccountId] = useState('')

  useEffect(() => {
    if (open) setOwnerAccountId(course?.ownerAccountId || '')
  }, [open, course])

  const canSubmit = ownerAccountId !== '' && !loading

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit(ownerAccountId)
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Assign owner — {course?.name}</DialogTitle>
      <DialogContent>
        <Box sx={{ mt: 1 }}>
          <SearchableSelect
            label="Course owner"
            placeholder="Search faculty…"
            value={ownerAccountId}
            onChange={setOwnerAccountId}
            options={instructorOptions}
          />
        </Box>
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
          {loading ? <CircularProgress size={20} /> : 'Assign'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default AssignOwnerDialog
