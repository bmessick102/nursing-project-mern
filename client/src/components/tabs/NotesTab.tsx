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
  FormControlLabel,
  Checkbox,
  Avatar,
  Tabs,
  Tab,
  CircularProgress,
  Stack,
} from '@mui/material'
import type { NursingNote } from '@types'
import SearchableSelect from 'components/common/SearchableSelect'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import EditMenu from 'components/edit/EditMenu'
import AddendumDialog from 'components/edit/AddendumDialog'
import MarkInErrorDialog from 'components/edit/MarkInErrorDialog'
import ModificationHistory from 'components/edit/ModificationHistory'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import AddendaList from 'components/edit/AddendaList'
import TabHeader from 'components/common/TabHeader'
import EmptyState from 'components/common/EmptyState'
import styles from 'styles/TabContent.module.css'

const blankForm = () => ({
  type: 'Progress Note',
  content: '',
  signed: false,
})

const NotesTab: React.FC = () => {
  const patient = useAppStore((s) => s.selectedPatient)
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null)
  const [mode, setMode] = useState<'view' | 'write' | 'edit'>('view')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState(0)
  const [form, setForm] = useState(blankForm())
  const [editReason, setEditReason] = useState('')

  const [addendumFor, setAddendumFor] = useState<NursingNote | null>(null)
  const [markInErrorFor, setMarkInErrorFor] = useState<NursingNote | null>(null)
  const [historyFor, setHistoryFor] = useState<NursingNote | null>(null)

  const {
    addNote,
    editResource,
    addAddendumToResource,
    markResourceInError,
    loading,
  } = useChartingApi()

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const nursingNotes = patient.nursingNotes || []
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
  const activeNote =
    (selectedNote && nursingNotes.find((n) => n._id === selectedNote._id)) || displayNotes[0]

  const startWrite = () => {
    setMode('write')
    setEditingId(null)
    setForm(blankForm())
    setEditReason('')
  }

  const startEdit = (note: NursingNote) => {
    setMode('edit')
    setEditingId(note._id)
    setForm({ type: note.type, content: note.content, signed: note.signed })
    setEditReason('')
    setSelectedNote(note)
  }

  const handleSave = async () => {
    if (!form.content) return

    try {
      if (mode === 'edit' && editingId) {
        const updated = await editResource(
          patient._id,
          'notes',
          editingId,
          { type: form.type, content: form.content, signed: form.signed },
          editReason || undefined,
        )
        setSelectedPatient(updated)
      } else {
        const note: Omit<NursingNote, '_id'> = {
          date: new Date().toLocaleDateString(),
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          type: form.type,
          author: username,
          authorRole: 'RN',
          content: form.content,
          signed: form.signed,
        }
        const updated = await addNote(patient._id, note)
        setSelectedPatient(updated)
      }
      setForm(blankForm())
      setMode('view')
      setEditingId(null)
      setEditReason('')
    } catch (err) {
      console.error('Failed to save note', err)
    }
  }

  const handleAddendumSubmit = async (content: string) => {
    if (!addendumFor) return
    try {
      const updated = await addAddendumToResource(
        patient._id,
        'notes',
        addendumFor._id,
        content,
        username,
        'RN',
      )
      setSelectedPatient(updated)
      const refreshed = updated.nursingNotes.find((n) => n._id === addendumFor._id)
      if (refreshed) setSelectedNote(refreshed)
      setAddendumFor(null)
    } catch (err) {
      console.error('Failed to add addendum', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'notes',
        markInErrorFor._id,
        reason,
        username,
      )
      setSelectedPatient(updated)
      const refreshed = updated.nursingNotes.find((n) => n._id === markInErrorFor._id)
      if (refreshed) setSelectedNote(refreshed)
      setMarkInErrorFor(null)
    } catch (err) {
      console.error('Failed to mark in error', err)
    }
  }

  return (
    <Box data-phi="true">
      <TabHeader title="Nursing Notes" actionLabel="Add Note" onAction={startWrite} />
      <Grid container spacing={2} className={styles.tabContainer}>
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              Filter
            </Typography>

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
                    backgroundColor:
                      selectedNote?._id === note._id ? '#FFFBF0' : '#fff',
                    borderLeft:
                      selectedNote?._id === note._id ? '4px solid #FFB81C' : '4px solid transparent',
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
            </Box>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          {(mode === 'view' || mode === 'edit') && activeNote && mode === 'view' && (
            <Paper sx={{ p: 2 }}>
              <InErrorBanner entry={activeNote} />
              <Box
                sx={{ mb: 2, pb: 1, borderBottom: '1px solid #eee', ...inErrorRowSx(activeNote.markedInError) }}
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
                      {activeNote.date} at {activeNote.time}
                    </Typography>
                    {activeNote.lastModifiedAt && (
                      <Typography variant="caption" sx={{ display: 'block', color: '#6B6B6B', mt: 0.5, fontStyle: 'italic' }}>
                        Modified by {activeNote.lastModifiedBy} at{' '}
                        {new Date(activeNote.lastModifiedAt).toLocaleString()}
                      </Typography>
                    )}
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    {activeNote.signed && (
                      <Typography
                        variant="caption"
                        sx={{
                          backgroundColor: '#E8F5E9',
                          color: '#4CAF50',
                          px: 1,
                          py: 0.5,
                          borderRadius: 1,
                        }}
                      >
                        ✓ Signed
                      </Typography>
                    )}
                    <EditMenu
                      entry={activeNote}
                      signed={activeNote.signed}
                      onEdit={() => startEdit(activeNote)}
                      onAddendum={() => setAddendumFor(activeNote)}
                      onMarkInError={() => setMarkInErrorFor(activeNote)}
                      onViewHistory={() => setHistoryFor(activeNote)}
                    />
                  </Stack>
                </Box>
              </Box>
              <Typography
                variant="body2"
                sx={{ color: '#333', lineHeight: 1.8, whiteSpace: 'pre-wrap', ...inErrorRowSx(activeNote.markedInError) }}
              >
                {activeNote.content}
              </Typography>
              <AddendaList addenda={activeNote.addenda} />
            </Paper>
          )}

          {(mode === 'write' || mode === 'edit') && (
            <Paper sx={{ p: 2 }}>
              <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600, mb: 2 }}>
                {mode === 'edit' ? 'Edit Note' : 'New Note'}
              </Typography>
              <Box sx={{ display: 'grid', gap: 2 }}>
                <SearchableSelect
                  label="Note Type"
                  value={form.type}
                  onChange={(v) => setForm({ ...form, type: v })}
                  options={noteTypes}
                />

                <TextField
                  multiline
                  rows={10}
                  placeholder="Enter note content..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  fullWidth
                />

                <FormControlLabel
                  control={
                    <Checkbox
                      checked={form.signed}
                      onChange={(e) => setForm({ ...form, signed: e.target.checked })}
                    />
                  }
                  label="Sign Note"
                />

                {mode === 'edit' && (
                  <TextField
                    label="Reason for edit (optional, but recommended)"
                    placeholder="e.g., Corrected vital sign value"
                    fullWidth
                    size="small"
                    value={editReason}
                    onChange={(e) => setEditReason(e.target.value)}
                  />
                )}

                <Box sx={{ display: 'flex', gap: 1 }}>
                  <Button
                    variant="contained"
                    onClick={handleSave}
                    disabled={loading || !form.content}
                    sx={{ backgroundColor: '#003D82' }}
                  >
                    {loading ? (
                      <CircularProgress size={20} />
                    ) : mode === 'edit' ? (
                      'Save Changes'
                    ) : (
                      'Save Note'
                    )}
                  </Button>
                  <Button
                    variant="outlined"
                    onClick={() => {
                      setMode('view')
                      setEditingId(null)
                    }}
                  >
                    Cancel
                  </Button>
                </Box>
              </Box>
            </Paper>
          )}
        </Grid>
      </Grid>

      <AddendumDialog
        open={addendumFor !== null}
        onClose={() => setAddendumFor(null)}
        onSubmit={handleAddendumSubmit}
        entityLabel="note"
        loading={loading}
      />
      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="note"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="note"
      />
    </Box>
  )
}

export default NotesTab
