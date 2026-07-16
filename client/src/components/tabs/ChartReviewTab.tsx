import React, { useState } from 'react'
import {
  Box,
  Paper,
  Typography,
  Grid,
  Card,
  CardActionArea,
  Avatar,
} from '@mui/material'
import type { NursingNote } from '@types'
import { useAppStore } from 'store/useAppStore'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import AddendaList from 'components/edit/AddendaList'
import InstructorCommentList from 'components/edit/InstructorCommentList'
import TabHeader from 'components/common/TabHeader'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

const ChartReviewTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null)

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const nursingNotes = patient.nursingNotes || []
  const displayNotes = [...nursingNotes].reverse()
  const activeNote =
    (selectedNote && nursingNotes.find((n) => n._id === selectedNote._id)) || displayNotes[0]

  return (
    <Box data-phi="true">
      <TabHeader title="Chart Review" />

      {nursingNotes.length === 0 ? (
        <EmptyState message="No notes yet." />
      ) : (
        <Grid container spacing={2} className={styles.tabContainer}>
          <Grid item xs={12} md={5}>
            <Paper sx={{ p: 2, maxHeight: 600, overflow: 'auto' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
                Notes
              </Typography>
              {displayNotes.map((note) => (
                <Card
                  key={note._id}
                  sx={{
                    mb: 1,
                    backgroundColor: selectedNote?._id === note._id ? '#FFFBF0' : '#fff',
                    borderLeft:
                      selectedNote?._id === note._id
                        ? '4px solid #FFB81C'
                        : '4px solid transparent',
                    ...inErrorRowSx(note.markedInError),
                  }}
                >
                  <CardActionArea onClick={() => setSelectedNote(note)} sx={{ p: 1.5 }}>
                    <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                      <Avatar
                        sx={{
                          width: 32,
                          height: 32,
                          backgroundColor: '#003D82',
                          fontSize: '0.75rem',
                        }}
                      >
                        {note.author.substring(0, 1)}
                      </Avatar>
                      <Box sx={{ flex: 1 }}>
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#003D82' }}>
                          {note.author}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                          {note.authorRole}
                        </Typography>
                      </Box>
                      {note.markedInError && <InErrorBanner entry={note} compact />}
                    </Box>
                    <Typography variant="caption" sx={{ color: '#666' }}>
                      {note.date} • {note.time}
                    </Typography>
                    <Typography variant="caption" sx={{ display: 'block', color: '#6B6B6B', mt: 0.5 }}>
                      {note.type}
                    </Typography>
                  </CardActionArea>
                </Card>
              ))}
            </Paper>
          </Grid>

          <Grid item xs={12} md={7}>
            {activeNote && (
              <Paper sx={{ p: 2 }}>
                <InErrorBanner entry={activeNote} />
                <Box
                  sx={{
                    mb: 2,
                    pb: 1,
                    borderBottom: '1px solid #eee',
                    ...inErrorRowSx(activeNote.markedInError),
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                    <Box>
                      <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600 }}>
                        {activeNote.type}
                      </Typography>
                      <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                        <strong>{activeNote.author}</strong> • {activeNote.authorRole}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#6B6B6B' }}>
                        {activeNote.date} • {activeNote.time}
                      </Typography>
                      {activeNote.lastModifiedAt && (
                        <Typography
                          variant="caption"
                          sx={{ display: 'block', color: '#6B6B6B', mt: 0.5, fontStyle: 'italic' }}
                        >
                          Modified by {activeNote.lastModifiedBy} at{' '}
                          {new Date(activeNote.lastModifiedAt).toLocaleString()}
                        </Typography>
                      )}
                    </Box>
                    {activeNote.signed && (
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: '#E8F5E9',
                          color: '#4CAF50',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                          height: 'fit-content',
                        }}
                      >
                        ✓ Signed
                      </Typography>
                    )}
                  </Box>
                </Box>
                {activeNote.format === 'soap' && activeNote.soap ? (
                  <Box sx={{ ...inErrorRowSx(activeNote.markedInError) }}>
                    {(
                      [
                        ['Subjective', activeNote.soap.subjective],
                        ['Objective', activeNote.soap.objective],
                        ['Assessment', activeNote.soap.assessment],
                        ['Plan', activeNote.soap.plan],
                      ] as const
                    )
                      .filter(([, value]) => value && value.trim())
                      .map(([label, value]) => (
                        <Box key={label} sx={{ mb: 1.5 }}>
                          <Typography
                            variant="caption"
                            sx={{ display: 'block', color: '#003D82', fontWeight: 700, mb: 0.25 }}
                          >
                            {label}
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{ color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap' }}
                          >
                            {value}
                          </Typography>
                        </Box>
                      ))}
                  </Box>
                ) : (
                  <Typography
                    variant="body2"
                    sx={{
                      color: '#333',
                      lineHeight: 1.8,
                      whiteSpace: 'pre-wrap',
                      ...inErrorRowSx(activeNote.markedInError),
                    }}
                  >
                    {activeNote.content}
                  </Typography>
                )}
                <AddendaList addenda={activeNote.addenda} />
                <InstructorCommentList comments={activeNote.instructorComments} />
              </Paper>
            )}
          </Grid>
        </Grid>
      )}
    </Box>
  )
}

export default ChartReviewTab
