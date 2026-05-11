import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Select,
  MenuItem,
  Button,
  FormControlLabel,
  Radio,
  RadioGroup,
  CircularProgress,
} from '@mui/material'
import type { Patient, IOEntry } from '@types'
import { useChartingApi } from 'hooks/useChartingApi'
import styles from 'styles/TabContent.module.css'

interface IOTabProps {
  patient: Patient | null
}

const IOTab: React.FC<IOTabProps> = ({ patient }) => {
  const [tabValue, setTabValue] = useState(0)
  const [form, setForm] = useState({
    type: 'intake' as 'intake' | 'output',
    category: 'Oral',
    amount: '',
    unit: 'mL',
  })
  const { addIO, loading } = useChartingApi()

  if (!patient) {
    return (
      <Paper className={styles.section}>
        <Box className={styles.emptyState}>
          <Typography>No patient selected</Typography>
        </Box>
      </Paper>
    )
  }

  const ioEntries = patient?.ioEntries || []
  const intakeCategories = ['Oral', 'IV', 'Tube Feeding', 'Other']
  const outputCategories = ['Urine', 'Stool', 'Vomitus', 'Drainage', 'Other']

  const handleSubmit = async () => {
    if (!form.amount) return

    try {
      const io: Omit<IOEntry, '_id'> = {
        timestamp: new Date().toISOString(),
        type: form.type,
        category: form.category,
        amount: parseInt(form.amount),
        unit: form.unit,
        documentedBy: 'Current User',
      }
      await addIO(patient._id, io)
      setForm({ type: 'intake', category: 'Oral', amount: '', unit: 'mL' })
      setTabValue(0)
    } catch (err) {
      console.error('Failed to add I/O entry', err)
    }
  }

  const intakes = ioEntries.filter((io) => io.type === 'intake')
  const outputs = ioEntries.filter((io) => io.type === 'output')
  const totalIntake = intakes.reduce((sum, io) => sum + io.amount, 0)
  const totalOutput = outputs.reduce((sum, io) => sum + io.amount, 0)
  const balance = totalIntake - totalOutput

  return (
    <Paper className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Intake & Output
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)}>
          <Tab label="View" />
          <Tab label="Document" />
        </Tabs>
      </Box>

      {tabValue === 0 && (
        <>
          <Grid container spacing={2} sx={{ mb: 3 }}>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#E3F2FD', borderLeft: '4px solid #003D82' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Intake
                </Typography>
                <Typography variant="h6" sx={{ color: '#003D82', fontWeight: 600 }}>
                  {totalIntake} mL
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: '#FFF3E0', borderLeft: '4px solid #FF9800' }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Total Output
                </Typography>
                <Typography variant="h6" sx={{ color: '#FF9800', fontWeight: 600 }}>
                  {totalOutput} mL
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={4}>
              <Paper sx={{ p: 2, backgroundColor: balance >= 0 ? '#E8F5E9' : '#FFEBEE', borderLeft: `4px solid ${balance >= 0 ? '#4CAF50' : '#d32f2f'}` }}>
                <Typography variant="body2" sx={{ color: '#666' }}>
                  Balance
                </Typography>
                <Typography variant="h6" sx={{ color: balance >= 0 ? '#4CAF50' : '#d32f2f', fontWeight: 600 }}>
                  {balance > 0 ? '+' : ''}{balance} mL
                </Typography>
              </Paper>
            </Grid>
          </Grid>

          <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr' }, gap: 2 }}>
            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Intake
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#E3F2FD' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...intakes].reverse().map((io) => (
                      <TableRow key={io._id}>
                        <TableCell>{new Date(io.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{io.category}</TableCell>
                        <TableCell>{io.amount} mL</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>

            <Box>
              <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
                Output
              </Typography>
              <TableContainer component={Paper}>
                <Table size="small">
                  <TableHead sx={{ backgroundColor: '#FFF3E0' }}>
                    <TableRow>
                      <TableCell sx={{ fontWeight: 600 }}>Time</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Category</TableCell>
                      <TableCell sx={{ fontWeight: 600 }}>Amount</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {[...outputs].reverse().map((io) => (
                      <TableRow key={io._id}>
                        <TableCell>{new Date(io.timestamp).toLocaleTimeString()}</TableCell>
                        <TableCell>{io.category}</TableCell>
                        <TableCell>{io.amount} mL</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          </Box>
        </>
      )}

      {tabValue === 1 && (
        <Grid container spacing={2}>
          <Grid item xs={12}>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
              Type
            </Typography>
            <RadioGroup
              row
              value={form.type}
              onChange={(e) =>
                setForm({
                  ...form,
                  type: e.target.value as 'intake' | 'output',
                  category: e.target.value === 'intake' ? 'Oral' : 'Urine',
                })
              }
            >
              <FormControlLabel value="intake" control={<Radio />} label="Intake" />
              <FormControlLabel value="output" control={<Radio />} label="Output" />
            </RadioGroup>
          </Grid>

          <Grid item xs={12} sm={6}>
            <Select
              value={form.category}
              onChange={(e) => setForm({ ...form, category: e.target.value })}
              fullWidth
            >
              {(form.type === 'intake' ? intakeCategories : outputCategories).map((cat) => (
                <MenuItem key={cat} value={cat}>
                  {cat}
                </MenuItem>
              ))}
            </Select>
          </Grid>

          <Grid item xs={12} sm={3}>
            <TextField
              label="Amount"
              type="number"
              value={form.amount}
              onChange={(e) => setForm({ ...form, amount: e.target.value })}
              fullWidth
            />
          </Grid>

          <Grid item xs={12} sm={3}>
            <Select value={form.unit} onChange={(e) => setForm({ ...form, unit: e.target.value })} fullWidth>
              <MenuItem value="mL">mL</MenuItem>
              <MenuItem value="cc">cc</MenuItem>
              <MenuItem value="L">L</MenuItem>
            </Select>
          </Grid>

          <Grid item xs={12}>
            <Button
              variant="contained"
              onClick={handleSubmit}
              disabled={loading || !form.amount}
              sx={{ backgroundColor: '#003D82' }}
            >
              {loading ? <CircularProgress size={24} /> : 'Log I/O'}
            </Button>
          </Grid>
        </Grid>
      )}
    </Paper>
  )
}

export default IOTab
