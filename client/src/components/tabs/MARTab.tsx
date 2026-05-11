import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  CircularProgress,
} from '@mui/material'
import type { Patient } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import styles from 'styles/TabContent.module.css'

interface MARTabProps {
  patient: Patient | null
}

interface SignoffState {
  entryId: string | null
  scheduledTime: string | null
}

const MARTab: React.FC<MARTabProps> = ({ patient }) => {
  const [signoffDialog, setSignoffDialog] = useState<SignoffState>({ entryId: null, scheduledTime: null })
  const { signMAR, loading } = useChartingApi()
  const marEntries = patient?.marEntries || []

  if (!patient || marEntries.length === 0) {
    return (
      <Paper className={styles.section}>
        <Typography variant="h6" className={styles.sectionTitle}>
          MAR (Medication Administration Record)
        </Typography>
        <Box className={styles.emptyState}>
          <Typography>No medications to administer</Typography>
        </Box>
      </Paper>
    )
  }

  const handleSignoff = async () => {
    if (!signoffDialog.entryId || !signoffDialog.scheduledTime || !patient._id) return

    try {
      await signMAR(patient._id, {
        entryId: signoffDialog.entryId,
        scheduledTime: signoffDialog.scheduledTime,
        givenBy: 'Current User',
      })
      setSignoffDialog({ entryId: null, scheduledTime: null })
    } catch (err) {
      console.error('Failed to sign MAR', err)
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'given':
        return '#4CAF50'
      case 'due':
        return '#999'
      case 'overdue':
        return '#FF9800'
      case 'held':
        return '#d32f2f'
      default:
        return '#999'
    }
  }

  return (
    <>
      <Paper className={styles.section} sx={{ overflow: 'auto' }}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Medication Administration Record
        </Typography>

        <TableContainer sx={{ overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600, minWidth: 150 }}>Medication</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Dose</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 80 }}>Route</TableCell>
                <TableCell sx={{ fontWeight: 600, minWidth: 100 }}>Frequency</TableCell>
                {['0600', '1200', '1800', '2200'].map((time) => (
                  <TableCell key={time} sx={{ fontWeight: 600, textAlign: 'center', minWidth: 80 }}>
                    {time}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {marEntries.map((mar) => (
                <TableRow key={mar._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{mar.medicationName}</TableCell>
                  <TableCell>{mar.dose}</TableCell>
                  <TableCell>{mar.route}</TableCell>
                  <TableCell>{mar.frequency}</TableCell>
                  {['0600', '1200', '1800', '2200'].map((time) => {
                    const admin = mar.administrations.find((a) => a.scheduledTime === time)
                    return (
                      <TableCell key={time} sx={{ textAlign: 'center' }}>
                        {admin ? (
                          <Chip
                            label={admin.status === 'given' ? '✓' : admin.status.substring(0, 2).toUpperCase()}
                            size="small"
                            sx={{
                              backgroundColor: getStatusColor(admin.status),
                              color: 'white',
                              fontWeight: 600,
                              cursor: admin.status !== 'given' ? 'pointer' : 'default',
                            }}
                            onClick={() => {
                              if (admin.status !== 'given') {
                                setSignoffDialog({
                                  entryId: mar._id,
                                  scheduledTime: time,
                                })
                              }
                            }}
                          />
                        ) : null}
                      </TableCell>
                    )
                  })}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Paper>

      <Dialog open={signoffDialog.entryId !== null} onClose={() => setSignoffDialog({ entryId: null, scheduledTime: null })} maxWidth="sm" fullWidth>
        <DialogTitle>Mark Medication as Given</DialogTitle>
        <DialogContent sx={{ pt: 2 }}>
          <Typography variant="body2" sx={{ mb: 2, color: '#666' }}>
            Are you sure you want to mark this medication as administered?
          </Typography>
          <TextField label="Given By" value="Current User" disabled fullWidth />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setSignoffDialog({ entryId: null, scheduledTime: null })}>Cancel</Button>
          <Button onClick={handleSignoff} variant="contained" disabled={loading}>
            {loading ? <CircularProgress size={24} /> : 'Confirm'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  )
}

export default MARTab
