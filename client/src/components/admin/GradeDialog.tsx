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
  Typography,
} from '@mui/material'

interface GradePayload {
  score: number
  maxScore: number
  feedback: string
}

interface GradeDialogProps {
  open: boolean
  loading?: boolean
  studentName?: string
  initial?: { score: number; maxScore: number; feedback?: string }
  onClose: () => void
  onSubmit: (grade: GradePayload) => Promise<void> | void
}

const GradeDialog: React.FC<GradeDialogProps> = ({
  open,
  loading,
  studentName,
  initial,
  onClose,
  onSubmit,
}) => {
  const [score, setScore] = useState('')
  const [maxScore, setMaxScore] = useState('100')
  const [feedback, setFeedback] = useState('')

  React.useEffect(() => {
    if (open) {
      if (initial) {
        setScore(String(initial.score))
        setMaxScore(String(initial.maxScore))
        setFeedback(initial.feedback ?? '')
      } else {
        setScore('')
        setMaxScore('100')
        setFeedback('')
      }
    }
  }, [open, initial])

  const scoreNum = Number(score)
  const maxScoreNum = Number(maxScore)

  const error =
    score.trim() === '' || Number.isNaN(scoreNum) || scoreNum < 0
      ? 'Score must be 0 or greater.'
      : Number.isNaN(maxScoreNum) || maxScoreNum < 1
      ? 'Max score must be 1 or greater.'
      : scoreNum > maxScoreNum
      ? 'Score cannot exceed max score.'
      : ''

  const canSubmit = !error && !loading

  const handleSubmit = async () => {
    if (!canSubmit) return
    await onSubmit({ score: scoreNum, maxScore: maxScoreNum, feedback })
  }

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} maxWidth="sm" fullWidth>
      <DialogTitle>Grade {studentName || 'student'}</DialogTitle>
      <DialogContent>
        <Grid container spacing={2} sx={{ mt: 0 }}>
          <Grid item xs={6}>
            <TextField
              label="Score"
              type="number"
              fullWidth
              size="small"
              value={score}
              onChange={(e) => setScore(e.target.value)}
              inputProps={{ min: 0 }}
              required
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              label="Max score"
              type="number"
              fullWidth
              size="small"
              value={maxScore}
              onChange={(e) => setMaxScore(e.target.value)}
              inputProps={{ min: 1 }}
              required
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              label="Feedback"
              fullWidth
              size="small"
              multiline
              minRows={4}
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
            />
          </Grid>
          {score.trim() !== '' && error && (
            <Grid item xs={12}>
              <Typography variant="caption" sx={{ color: '#B71C1C' }}>
                {error}
              </Typography>
            </Grid>
          )}
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
          {loading ? <CircularProgress size={20} /> : 'Save Grade'}
        </Button>
      </DialogActions>
    </Dialog>
  )
}

export default GradeDialog
