import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import {
  Box,
  Container,
  Typography,
  Paper,
  Stack,
  Chip,
  Button,
  Alert,
  CircularProgress,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
  Divider,
} from '@mui/material'
import type { Patient, NursingNote } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import { useSnackbar } from 'contexts/SnackbarContext'
import PeerAssessmentList from 'components/edit/PeerAssessmentList'

type ChartData = { peerReviewId: string; status: string; patient: Patient }
type NoteControl = { correct: boolean; comment: string; saving: boolean }

const PeerReviewChartPage: React.FC = () => {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getPeerReviewChart, submitPeerAssessment } = useChartingApi()
  const notify = useSnackbar()
  const [data, setData] = useState<ChartData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [controls, setControls] = useState<Record<string, NoteControl>>({})

  // Seed per-note controls from any existing assessment on that note.
  const seedControls = (patient: Patient) => {
    const seeded: Record<string, NoteControl> = {}
    for (const note of patient.nursingNotes || []) {
      const existing = note.peerAssessments && note.peerAssessments[note.peerAssessments.length - 1]
      seeded[note._id] = {
        correct: existing ? existing.correct : true,
        comment: existing ? existing.comment : '',
        saving: false,
      }
    }
    setControls(seeded)
  }

  useEffect(() => {
    if (!id) return
    let active = true
    const load = async () => {
      setLoading(true)
      try {
        const chart = await getPeerReviewChart(id)
        if (!active) return
        setError(null)
        setData(chart)
        seedControls(chart.patient)
      } catch (err) {
        console.error('Failed to load peer review chart:', err)
        if (active) setError('Failed to load peer review chart.')
      } finally {
        if (active) setLoading(false)
      }
    }
    load()
    return () => {
      active = false
    }
  }, [id, getPeerReviewChart])

  const setControl = (noteId: string, patch: Partial<NoteControl>) => {
    setControls((prev) => ({
      ...prev,
      [noteId]: { ...prev[noteId], ...patch },
    }))
  }

  const handleSave = async (note: NursingNote) => {
    if (!id) return
    const control = controls[note._id]
    if (!control) return
    setControl(note._id, { saving: true })
    try {
      await submitPeerAssessment(id, note._id, {
        correct: control.correct,
        comment: control.comment,
      })
      const chart = await getPeerReviewChart(id)
      setData(chart)
      seedControls(chart.patient)
      if (notify?.notifySuccess) notify.notifySuccess('Assessment saved.')
      else console.log('Assessment saved.')
    } catch (err) {
      console.error('Failed to submit peer assessment:', err)
      setControl(note._id, { saving: false })
    }
  }

  const patient = data?.patient
  const notes = patient?.nursingNotes || []

  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4" sx={{ fontWeight: 700, color: '#003D82' }}>
          Peer Review
        </Typography>
        <Stack direction="row" spacing={1} alignItems="center">
          {data && (
            <Chip
              size="small"
              label={data.status}
              color={data.status === 'submitted' ? 'success' : 'warning'}
              variant={data.status === 'submitted' ? 'filled' : 'outlined'}
              sx={{ textTransform: 'capitalize' }}
            />
          )}
          <Button variant="outlined" onClick={() => navigate('/peer-reviews')}>
            Back
          </Button>
        </Stack>
      </Box>

      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', pt: 6 }}>
          <CircularProgress />
        </Box>
      ) : !patient ? (
        !error && <Alert severity="info">No chart available.</Alert>
      ) : (
        <>
          <Paper variant="outlined" sx={{ p: 2, mb: 3 }}>
            <Typography variant="h6" sx={{ fontWeight: 600 }}>
              {patient.name}
            </Typography>
            <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
              {patient.age} y/o {patient.gender}
              {patient.roomNumber ? ` • Room ${patient.roomNumber}` : ''}
            </Typography>
          </Paper>

          {notes.length === 0 ? (
            <Alert severity="info">This chart has no nursing notes to review.</Alert>
          ) : (
            <Stack spacing={3}>
              {notes.map((note) => {
                const control = controls[note._id] || {
                  correct: true,
                  comment: '',
                  saving: false,
                }
                return (
                  <Paper key={note._id} sx={{ p: 2 }}>
                    <Typography variant="subtitle1" sx={{ fontWeight: 600, color: '#003D82' }}>
                      {note.type}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'block' }}>
                      {note.authorRole}
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'block', mb: 1 }}>
                      {note.date} • {note.time}
                    </Typography>

                    {note.format === 'soap' && note.soap ? (
                      <Box>
                        {(
                          [
                            ['Subjective', note.soap.subjective],
                            ['Objective', note.soap.objective],
                            ['Assessment', note.soap.assessment],
                            ['Plan', note.soap.plan],
                          ] as const
                        )
                          .filter(([, value]) => value && value.trim() !== '')
                          .map(([label, value]) => (
                            <Box key={label} sx={{ mb: 1 }}>
                              <Typography variant="body2" sx={{ fontWeight: 700, color: '#003D82' }}>
                                {label}
                              </Typography>
                              <Typography
                                variant="body2"
                                sx={{ color: '#333', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                              >
                                {value}
                              </Typography>
                            </Box>
                          ))}
                      </Box>
                    ) : (
                      <Typography
                        variant="body2"
                        sx={{ color: '#333', whiteSpace: 'pre-wrap', overflowWrap: 'anywhere' }}
                      >
                        {note.content}
                      </Typography>
                    )}

                    <PeerAssessmentList assessments={note.peerAssessments} />

                    <Divider sx={{ my: 2 }} />

                    <Stack spacing={1.5}>
                      <Box>
                        <Typography
                          variant="caption"
                          sx={{ color: '#6B6B6B', display: 'block', mb: 0.5 }}
                        >
                          Your assessment
                        </Typography>
                        <ToggleButtonGroup
                          exclusive
                          size="small"
                          aria-label="Your assessment"
                          value={control.correct}
                          onChange={(_, val) => {
                            if (val !== null) setControl(note._id, { correct: val })
                          }}
                        >
                          <ToggleButton value={true} sx={{ textTransform: 'none' }}>
                            Correct
                          </ToggleButton>
                          <ToggleButton value={false} sx={{ textTransform: 'none' }}>
                            Needs work
                          </ToggleButton>
                        </ToggleButtonGroup>
                      </Box>
                      <TextField
                        multiline
                        rows={3}
                        label="Comment"
                        placeholder="Explain your assessment..."
                        value={control.comment}
                        onChange={(e) => setControl(note._id, { comment: e.target.value })}
                        fullWidth
                      />
                      <Box>
                        <Button
                          variant="contained"
                          onClick={() => handleSave(note)}
                          disabled={control.saving}
                          sx={{ backgroundColor: '#003D82' }}
                        >
                          {control.saving ? <CircularProgress size={20} /> : 'Save assessment'}
                        </Button>
                      </Box>
                    </Stack>
                  </Paper>
                )
              })}
            </Stack>
          )}
        </>
      )}
    </Container>
  )
}

export default PeerReviewChartPage
