import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  List,
  ListItem,
  ListItemButton,
} from '@mui/material'
import type { Patient } from '@types'
import styles from 'styles/TabContent.module.css'

interface ResultsTabProps {
  patient: Patient | null
}

const ResultsTab: React.FC<ResultsTabProps> = ({ patient }) => {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const labs = patient?.labs || []

  if (!patient || labs.length === 0) {
    return (
      <Paper className={styles.section}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Results
        </Typography>
        <Box className={styles.emptyState}>
          <Typography>No lab results available</Typography>
        </Box>
      </Paper>
    )
  }

  const categories = Array.from(new Set(labs.map((lab) => lab.category)))
  const active = selectedCategory || categories[0]
  const filtered = labs.filter((lab) => lab.category === active)

  const getFlagColor = (flag?: string) => {
    switch (flag) {
      case 'H':
        return '#FF9800'
      case 'L':
        return '#003D82'
      case 'C':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  return (
    <Grid container spacing={2} className={styles.tabContainer}>
      <Grid item xs={12} md={3}>
        <Paper sx={{ p: 2 }}>
          <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 2 }}>
            Categories
          </Typography>
          <List sx={{ p: 0 }}>
            {categories.map((cat) => (
              <ListItem key={cat} disablePadding>
                <ListItemButton
                  selected={cat === active}
                  onClick={() => setSelectedCategory(cat)}
                  sx={{
                    borderLeft: cat === active ? '4px solid #FFB81C' : '4px solid transparent',
                    backgroundColor: cat === active ? '#FFFBF0' : 'transparent',
                    fontWeight: cat === active ? 700 : 400,
                  }}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: cat === active ? '#003D82' : '#1F2937',
                      fontWeight: cat === active ? 700 : 400,
                    }}
                  >
                    {cat}
                  </Typography>
                </ListItemButton>
              </ListItem>
            ))}
          </List>
        </Paper>
      </Grid>

      <Grid item xs={12} md={9}>
        <TableContainer component={Paper}>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Test Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Result</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Reference Range</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Flag</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filtered.map((lab) => (
                <TableRow key={lab._id}>
                  <TableCell>{lab.name}</TableCell>
                  <TableCell>
                    {lab.value} {lab.unit}
                  </TableCell>
                  <TableCell sx={{ color: '#999' }}>{lab.referenceRange}</TableCell>
                  <TableCell>
                    {lab.flag ? (
                      <Chip
                        label={lab.flag}
                        size="small"
                        sx={{ backgroundColor: getFlagColor(lab.flag), color: 'white', fontWeight: 600 }}
                      />
                    ) : (
                      <Typography variant="caption" sx={{ color: '#999' }}>
                        —
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ color: '#999' }}>{new Date(lab.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </Grid>
    </Grid>
  )
}

export default ResultsTab
