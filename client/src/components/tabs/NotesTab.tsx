import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Card,
  CardActionArea,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControlLabel,
  Checkbox,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
} from '@mui/material'
import type { Patient, NursingNote } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import styles from 'styles/TabContent.module.css'

interface NotesTabProps {
  patient: Patient | null
}

const NotesTab: React.FC<NotesTabProps> = ({ patient }) => {
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null)
  const [mode, setMode] = useState<'view' | 'write'>('view')
  const [filterTab, setFilterTab] = useState(0)
  const [form, setForm] = useState({
    type: 'Progress Note',
    content: '',
    signed: false,
  })
  const { addNote, loading } = useChartingApi()

  if (!patient) {
    return (
      <Paper className={styles.section}>
        <Box className={styles.emptyState}>
          <Typography>No patient selected</Typography>
        </Box>
      </Paper>
    )
  }

  const nursingNotes = patient?.nursingNotes || []
  const noteTypes = ['Progress Note', 'Assessment', 'Procedure Note', 'Incident Report']
  const filters = ['All Notes', 'Progress', 'Procedures', 'Assessment', 'Incomplete']

  const getFilteredNotes = () => {
    const filterMap: Record<number, (note: NursingNote) => boolean> = {
      0: () => true,
      1: (note) => note.type.includes('Progress'),
      2: (note) => note.type.includes('Procedure'),
      3: (note) => note.type.includes('Assessment'),
      4: (note) => !note.signed,
    }
    return nursingNotes.filter(filterMap[filterTab])
  }

  const filteredNotes = getFilteredNotes()
  const displayNotes = [...filteredNotes].reverse()
  const activeNote = selectedNote || displayNotes[0]

  const handleSave = async () => {
    if (!form.content) return

    try {
      const note: Omit<NursingNote, '_id'> = {
        date: new Date().toLocaleDateString(),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        type: form.type,
        author: 'Current User',
        authorRole: 'RN',
        content: form.content,
        signed: form.signed,
      }
      await addNote(patient._id, note)
      setForm({ type: 'Progress Note', content: '', signed: false })
      setMode('view')
      setSelectedNote(null)
    } catch (err) {
      console.error('Failed to save note', err)
    }
  }

  return (
    <Grid container spacing={2} className={styles.tabContainer}>
      <Grid item xs={12} md={4}>
        <Paper sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
              Notes
            </Typography>
            <Button size="small" variant="contained" onClick={() => setMode('write')} sx={{ backgroundColor: '#003D82' }}>
              New Note
            </Button>
          </Box>

          <Tabs
            orientation="vertical"
            value={filterTab}
            onChange={(_, val) => {
              setFilterTab(val)
              setSelectedNote(null)
            }}
            sx={{ mb: 2 }}
          >
            {filters.map((f) => (
              <Tab key={f} label={f} />
            ))}
          </Tabs>

          <Box sx={{ maxHeight: 500, overflow: 'auto' }}>
            {displayNotes.map((note) => (
              <Card
                key={note._id}
                sx={{
                  mb: 1,
                  backgroundColor: selectedNote?._id === note._id ? '#FFFBF0' : '#fff',
                  borderLeft: selectedNote?._id === note._id ? '4px solid #FFB81C' : '4px solid transparent',
                }}
              >
                <CardActionArea onClick={() => setSelectedNote(note)} sx={{ p: 1.5 }}>
                  <Box sx={{ display: 'flex', gap: 1, mb: 0.5 }}>
                    <Avatar sx={{ width: 32, height: 32, backgroundColor: '#003D82', fontSize: '0.75rem' }}>
                      {note.author.substring(0, 1)}
                    </Avatar>
                    <Box sx={{ flex: 1 }}>
                      <Typography variant="body2" sx={{ fontWeight: 600, color: '#003D82' }}>
                        {note.author}
                      </Typography>
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        {note.authorRole}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="caption" sx={{ color: '#666' }}>
                    {note.date} • {note.time}
                  </Typography>
                  <Typography variant="caption" sx={{ display: 'block', color: '#999', mt: 0.5 }}>
                    {note.type}
                  </Typography>
                </CardActionArea>
              </Card>
            ))}
          </Box>
        </Paper>
      </Grid>

      <Grid item xs={12} md={8}>
        {mode === 'view' && activeNote && (
          <Paper sx={{ p: 2 }}>
            <Box sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee' }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start' }}>
                <Box>
                  <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600 }}>
                    {activeNote.type}
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#666', mt: 0.5 }}>
                    <strong>{activeNote.author}</strong> • {activeNote.authorRole}
                  </Typography>
                  <Typography variant="caption" sx={{ color: '#999' }}>
                    {activeNote.date} at {activeNote.time}
                  </Typography>
                </Box>
                {activeNote.signed && (
                  <Typography variant="caption" sx={{ backgroundColor: '#E8F5E9', color: '#4CAF50', px: 1, py: 0.5, borderRadius: 1 }}>
                    ✓ Signed
                  </Typography>
                )}
              </Box>
            </Box>
            <Typography variant="body2" sx={{ color: '#333', lineHeight: 1.8 }}>
              {activeNote.content}
            </Typography>
          </Paper>
        )}

        {mode === 'write' && (
          <Paper sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600, mb: 2 }}>
              New Note
            </Typography>
            <Box sx={{ display: 'grid', gap: 2 }}>
              <Select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value })}
              >
                {noteTypes.map((type) => (
                  <MenuItem key={type} value={type}>
                    {type}
                  </MenuItem>
                ))}
              </Select>

              <TextField
                multiline
                rows={10}
                placeholder="Enter note content..."
                value={form.content}
                onChange={(e) => setForm({ ...form, content: e.target.value })}
                fullWidth
              />

              <FormControlLabel
                control={<Checkbox checked={form.signed} onChange={(e) => setForm({ ...form, signed: e.target.checked })} />}
                label="Sign Note"
              />

              <Box sx={{ display: 'flex', gap: 1 }}>
                <Button
                  variant="contained"
                  onClick={handleSave}
                  disabled={loading || !form.content}
                  sx={{ backgroundColor: '#003D82' }}
                >
                  {loading ? <CircularProgress size={24} /> : 'Save Note'}
                </Button>
                <Button variant="outlined" onClick={() => setMode('view')}>
                  Cancel
                </Button>
              </Box>
            </Box>
          </Paper>
        )}
      </Grid>
    </Grid>
  )
}

export default NotesTab
