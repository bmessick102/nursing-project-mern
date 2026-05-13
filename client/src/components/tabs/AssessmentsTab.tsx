import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Tabs,
  Tab,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Stack,
} from '@mui/material'
import { ExpandMore } from '@mui/icons-material'
import type { AssessmentSystem, NursingAssessment, Patient } from '@types'
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
import NeuroAssessment from 'components/assessments/NeuroAssessment'
import CardiacAssessment from 'components/assessments/CardiacAssessment'
import RespiratoryAssessment from 'components/assessments/RespiratoryAssessment'
import GIAssessment from 'components/assessments/GIAssessment'
import GUAssessment from 'components/assessments/GUAssessment'
import SkinIntegrityAssessment from 'components/assessments/SkinIntegrityAssessment'
import PainAssessment from 'components/assessments/PainAssessment'
import MusculoskeletalAssessment from 'components/assessments/MusculoskeletalAssessment'
import PsychosocialAssessment from 'components/assessments/PsychosocialAssessment'
import styles from 'styles/TabContent.module.css'

interface AssessmentsTabProps {
  patient: Patient | null
}

const SYSTEM_LABEL: Record<AssessmentSystem, string> = {
  neuro: 'Neurological',
  cardiac: 'Cardiovascular',
  respiratory: 'Respiratory',
  gi: 'Gastrointestinal',
  gu: 'Genitourinary',
  skin: 'Skin / Integumentary',
  pain: 'Pain (PQRST)',
  musculoskeletal: 'Musculoskeletal',
  psychosocial: 'Psychosocial',
}

const AssessmentsTab: React.FC<AssessmentsTabProps> = ({ patient }) => {
  const setSelectedPatient = useAppStore((s) => s.setSelectedPatient)
  const { username } = useCurrentUser()
  const [view, setView] = useState(0)
  const [expanded, setExpanded] = useState<string | false>('neuro')
  const [addendumFor, setAddendumFor] = useState<NursingAssessment | null>(null)
  const [markInErrorFor, setMarkInErrorFor] = useState<NursingAssessment | null>(null)
  const [historyFor, setHistoryFor] = useState<NursingAssessment | null>(null)
  const { addAddendumToResource, markResourceInError, loading } = useChartingApi()

  if (!patient) {
    return <EmptyState message="No patient selected" />
  }

  const handleSaved = (updated: Patient) => {
    setSelectedPatient(updated)
  }

  const handleAddendumSubmit = async (content: string) => {
    if (!addendumFor || !patient) return
    try {
      const updated = await addAddendumToResource(
        patient._id,
        'assessments',
        addendumFor._id,
        content,
        username,
        'RN',
      )
      setSelectedPatient(updated)
      setAddendumFor(null)
    } catch (err) {
      console.error('Failed to add addendum', err)
    }
  }

  const handleMarkInErrorSubmit = async (reason: string) => {
    if (!markInErrorFor || !patient) return
    try {
      const updated = await markResourceInError(
        patient._id,
        'assessments',
        markInErrorFor._id,
        reason,
        username,
      )
      setSelectedPatient(updated)
      setMarkInErrorFor(null)
    } catch (err) {
      console.error('Failed to mark in error', err)
    }
  }

  const assessments = patient.assessments || []
  const lastBySystem = (system: AssessmentSystem) =>
    [...assessments]
      .filter((a) => a.system === system)
      .sort((a, b) => b.timestamp.localeCompare(a.timestamp))[0]

  const sortedHistory = [...assessments].sort((a, b) =>
    b.timestamp.localeCompare(a.timestamp),
  )

  const sections: Array<{
    key: AssessmentSystem
    title: string
    Component: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }>
  }> = [
    { key: 'neuro', title: 'Neurological', Component: NeuroAssessment },
    { key: 'cardiac', title: 'Cardiovascular', Component: CardiacAssessment },
    { key: 'respiratory', title: 'Respiratory', Component: RespiratoryAssessment },
    { key: 'gi', title: 'Gastrointestinal', Component: GIAssessment },
    { key: 'gu', title: 'Genitourinary', Component: GUAssessment },
    { key: 'skin', title: 'Skin / Integumentary', Component: SkinIntegrityAssessment },
    { key: 'pain', title: 'Pain (PQRST)', Component: PainAssessment },
    { key: 'musculoskeletal', title: 'Musculoskeletal', Component: MusculoskeletalAssessment },
    { key: 'psychosocial', title: 'Psychosocial', Component: PsychosocialAssessment },
  ]

  return (
    <>
      <TabHeader title="Nursing Assessments — Head-to-Toe" />
      <Paper className={styles.section}>
        <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={view} onChange={(_, v) => setView(v)}>
          <Tab label="Document Assessment" />
          <Tab label={`History (${assessments.length})`} />
        </Tabs>
      </Box>

      {view === 0 && (
        <Stack spacing={1}>
          {sections.map(({ key, title, Component }) => {
            const last = lastBySystem(key)
            return (
              <Accordion
                key={key}
                expanded={expanded === key}
                onChange={(_, isExpanded) => setExpanded(isExpanded ? key : false)}
                disableGutters
              >
                <AccordionSummary expandIcon={<ExpandMore />}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    sx={{ width: '100%', pr: 2 }}
                  >
                    <Typography sx={{ fontWeight: 600 }}>{title}</Typography>
                    {last ? (
                      <Chip
                        size="small"
                        color={last.wdl ? 'success' : 'warning'}
                        label={last.wdl ? 'WDL' : 'Abnormal'}
                        variant="outlined"
                      />
                    ) : (
                      <Chip
                        size="small"
                        label="Not yet documented"
                        variant="outlined"
                        sx={{ color: '#6B6B6B' }}
                      />
                    )}
                  </Stack>
                </AccordionSummary>
                <AccordionDetails>
                  <Component patient={patient} onSaved={handleSaved} />
                </AccordionDetails>
              </Accordion>
            )
          })}
        </Stack>
      )}

      {view === 1 && (
        <TableContainer>
          {sortedHistory.length === 0 ? (
            <Box className={styles.emptyState}>
              <Typography>No assessments documented yet</Typography>
            </Box>
          ) : (
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell sx={{ fontWeight: 600 }}>Date/Time</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>System</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Findings</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>Narrative & Addenda</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}>By</TableCell>
                  <TableCell sx={{ fontWeight: 600 }}></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {sortedHistory.map((a) => (
                  <TableRow key={a._id} sx={inErrorRowSx(a.markedInError)}>
                    <TableCell>
                      <Stack direction="row" spacing={1} alignItems="center">
                        {new Date(a.timestamp).toLocaleString()}
                        {a.markedInError && <InErrorBanner entry={a} compact />}
                      </Stack>
                    </TableCell>
                    <TableCell>{SYSTEM_LABEL[a.system]}</TableCell>
                    <TableCell>
                      <Chip
                        size="small"
                        color={a.wdl ? 'success' : 'warning'}
                        label={a.wdl ? 'WDL' : 'Abnormal'}
                      />
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#555', maxWidth: 320 }}>
                      {Object.entries(a.findings)
                        .filter(([, v]) => v !== '' && v !== false && v != null)
                        .map(([k, v]) => `${k}: ${v}`)
                        .join(' · ')}
                    </TableCell>
                    <TableCell sx={{ fontSize: 12, color: '#555', maxWidth: 320 }}>
                      <Box>{a.narrative || '—'}</Box>
                      {a.addenda && a.addenda.length > 0 && (
                        <Box sx={{ mt: 1 }}>
                          <AddendaList addenda={a.addenda} />
                        </Box>
                      )}
                    </TableCell>
                    <TableCell sx={{ color: '#6B6B6B' }}>{a.documentedBy}</TableCell>
                    <TableCell>
                      <EditMenu
                        entry={a}
                        signed={a.signed}
                        onAddendum={() => setAddendumFor(a)}
                        onMarkInError={() => setMarkInErrorFor(a)}
                        onViewHistory={() => setHistoryFor(a)}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </TableContainer>
      )}

      <AddendumDialog
        open={addendumFor !== null}
        onClose={() => setAddendumFor(null)}
        onSubmit={handleAddendumSubmit}
        entityLabel="assessment"
        loading={loading}
      />
      <MarkInErrorDialog
        open={markInErrorFor !== null}
        onClose={() => setMarkInErrorFor(null)}
        onSubmit={handleMarkInErrorSubmit}
        entityLabel="assessment"
        loading={loading}
      />
      <ModificationHistory
        open={historyFor !== null}
        onClose={() => setHistoryFor(null)}
        entry={historyFor}
        entityLabel="assessment"
      />
      </Paper>
    </>
  )
}

export default AssessmentsTab
