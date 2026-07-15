import React, { useState, useRef, useLayoutEffect } from 'react'
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
import { INSERT_SECTIONS } from 'utils/noteAutofill'
import { useAppStore } from 'store/useAppStore'
import { useChartingApi } from 'hooks/useChartingApi'
import { useCurrentUser } from 'hooks/useCurrentUser'
import { useAuth } from 'contexts/AuthContext'
import EditMenu from 'components/edit/EditMenu'
import AddendumDialog from 'components/edit/AddendumDialog'
import MarkInErrorDialog from 'components/edit/MarkInErrorDialog'
import ModificationHistory from 'components/edit/ModificationHistory'
import InErrorBanner, { inErrorRowSx } from 'components/edit/InErrorBanner'
import AddendaList from 'components/edit/AddendaList'
import InstructorCommentList from 'components/edit/InstructorCommentList'
import InstructorCommentDialog from 'components/edit/InstructorCommentDialog'
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
  const { account } = useAuth()
  const [selectedNote, setSelectedNote] = useState<NursingNote | null>(null)
  const [mode, setMode] = useState<'view' | 'write' | 'edit'>('view')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterTab, setFilterTab] = useState(0)
  const [form, setForm] = useState(blankForm())
  const [editReason, setEditReason] = useState('')
  const contentRef = useRef<HTMLTextAreaElement>(null)
  const [pendingCaret, setPendingCaret] = useState<number | null>(null)

  const [addendumFor, setAddendumFor] = useState<NursingNote | null>(null)
  const [markInErrorFor, setMarkInErrorFor] = useState<NursingNote | null>(null)
  const [historyFor, setHistoryFor] = useState<NursingNote | null>(null)
  const [commentFor, setCommentFor] = useState<NursingNote | null>(null)

  const {
    addNote,
    editResource,
    addAddendumToResource,
    markResourceInError,
    adminAddNoteComment,
    loading,
  } = useChartingApi()

  // Restore the caret after a controlled re-render caused by inserting a data block.
  // Must run on every render (before the early return) to satisfy the rules of hooks.
  useLayoutEffect(() => {
    if (pendingCaret == null) return
    const el = contentRef.current
    if (el) {
      el.focus()
      el.setSelectionRange(pendingCaret, pendingCaret)
    }
    setPendingCaret(null)
  }, [pendingCaret])

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const nursingNotes = patient.nursingNotes || []
  const instructorNotes = patient.instructorNotes || []

  // Viewer context for case-study patients (template -> per-student instance model).
  // An instance carries ownerAccountId (the student) and templateId. A student's instance
  // also carries a derived read-only `instructorNotes` (the instructor's live notes).
  const role = account?.role
  const isInstructorRole = role === 'administrator' || role === 'admin' || role === 'instructor'
  const isInstance = Boolean(patient.ownerAccountId || patient.templateId)
  const isOwnerStudent = isInstance && account?._id === patient.ownerAccountId
  const instructorReview = isInstance && isInstructorRole && !isOwnerStudent
  const studentTwoPane = isInstance && !isInstructorRole
  const canAuthorNotes = !instructorReview // instructors review student notes, they don't author them

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

  const insertSnippet = (snippet: string) => {
    const el = contentRef.current
    const text = form.content
    const start = el?.selectionStart ?? text.length
    const end = el?.selectionEnd ?? text.length
    const block = (start > 0 && text[start - 1] !== '\n' ? '\n' : '') + snippet
    setForm({ ...form, content: text.slice(0, start) + block + text.slice(end) })
    setPendingCaret(start + block.length)
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

  const handleAddComment = async (content: string) => {
    if (!commentFor) return
    try {
      const updated = await adminAddNoteComment(patient._id, commentFor._id, content)
      setSelectedPatient(updated)
      const refreshed = updated.nursingNotes.find((n) => n._id === commentFor._id)
      if (refreshed) setSelectedNote(refreshed)
      setCommentFor(null)
    } catch (err) {
      console.error('Failed to add instructor comment', err)
    }
  }

  return (
    <Box data-phi="true">
      <TabHeader
        title={instructorReview ? 'Student Notes — Instructor Review' : 'Nursing Notes'}
        actionLabel={canAuthorNotes ? 'Add Note' : undefined}
        onAction={canAuthorNotes ? startWrite : undefined}
      />
      <Grid container spacing={2} className={styles.tabContainer}>
        {studentTwoPane && (
          <Grid item xs={12} md={4}>
            <Paper sx={{ p: 2, height: '100%' }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2, color: '#003D82' }}>
                Instructor Notes
              </Typography>
              {instructorNotes.length === 0 ? (
                <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
                  No instructor notes yet.
                </Typography>
              ) : (
                <Box sx={{ maxHeight: 560, overflow: 'auto' }}>
                  <Stack spacing={1}>
                    {[...instructorNotes].reverse().map((note) => (
                      <Paper
                        key={note._id}
                        variant="outlined"
                        sx={{ p: 1.5, borderLeft: '4px solid #003D82', backgroundColor: '#f5f8fc' }}
                      >
                        <Typography variant="body2" sx={{ fontWeight: 600, color: '#003D82' }}>
                          {note.type}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#666', display: 'block' }}>
                          {note.author}
                          {note.authorRole ? ` • ${note.authorRole}` : ''}
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'block', mb: 0.5 }}>
                          {note.date} • {note.time}
                        </Typography>
                        <Typography variant="body2" sx={{ color: '#333', whiteSpace: 'pre-wrap' }}>
                          {note.content}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Box>
              )}
            </Paper>
          </Grid>
        )}
        <Grid item xs={12} md={studentTwoPane ? 3 : 4}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
              {studentTwoPane ? 'My Notes' : instructorReview ? 'Student Notes' : 'Filter'}
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

        <Grid item xs={12} md={studentTwoPane ? 5 : 8}>
          {mode === 'view' && !activeNote && instructorReview && (
            <Paper sx={{ p: 3 }}>
              <Typography variant="body2" sx={{ color: '#6B6B6B' }}>
                This student hasn&apos;t written any notes yet.
              </Typography>
            </Paper>
          )}
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
                    {canAuthorNotes && (
                      <EditMenu
                        entry={activeNote}
                        signed={activeNote.signed}
                        onEdit={() => startEdit(activeNote)}
                        onAddendum={() => setAddendumFor(activeNote)}
                        onMarkInError={() => setMarkInErrorFor(activeNote)}
                        onViewHistory={() => setHistoryFor(activeNote)}
                      />
                    )}
                    {instructorReview && (
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => setCommentFor(activeNote)}
                        sx={{ backgroundColor: '#003D82', textTransform: 'none' }}
                      >
                        Add comment
                      </Button>
                    )}
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
              <InstructorCommentList comments={activeNote.instructorComments} />
            </Paper>
          )}

          {canAuthorNotes && (mode === 'write' || mode === 'edit') && (
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
                  freeSolo
                />

                <Box>
                  <Typography variant="caption" sx={{ color: '#6B6B6B', display: 'block', mb: 0.5 }}>
                    Insert latest data
                  </Typography>
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    {INSERT_SECTIONS.map((s) => (
                      <Button
                        key={s.key}
                        size="small"
                        variant="outlined"
                        disabled={!s.hasData(patient)}
                        onClick={() => insertSnippet(s.build(patient))}
                        sx={{ textTransform: 'none' }}
                      >
                        {s.label}
                      </Button>
                    ))}
                  </Stack>
                </Box>

                <TextField
                  multiline
                  rows={10}
                  placeholder="Enter note content..."
                  value={form.content}
                  onChange={(e) => setForm({ ...form, content: e.target.value })}
                  inputRef={contentRef}
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
      <InstructorCommentDialog
        open={commentFor !== null}
        onClose={() => setCommentFor(null)}
        onSubmit={handleAddComment}
        loading={loading}
      />
    </Box>
  )
}

export default NotesTab
