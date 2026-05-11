import React, { useState } from 'react'
import {
  Paper,
  Typography,
  Box,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material'
import type { Patient } from '@types'
import styles from 'styles/TabContent.module.css'

interface OrdersTabProps {
  patient: Patient | null
}

const OrdersTab: React.FC<OrdersTabProps> = ({ patient }) => {
  const [tabValue, setTabValue] = useState(0)

  if (!patient) {
    return (
      <Paper className={styles.section}>
        <Box className={styles.emptyState}>
          <Typography>No patient selected</Typography>
        </Box>
      </Paper>
    )
  }

  const tabs = ['Medications', 'Diet', 'Labs', 'Nursing', 'Therapies', 'Discharge Summary']
  const tabTypes: Array<'medication' | 'diet' | 'lab' | 'nursing' | 'therapy' | 'discharge'> = [
    'medication',
    'diet',
    'lab',
    'nursing',
    'therapy',
    'discharge',
  ]

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return '#003D82'
      case 'completed':
        return '#999'
      case 'discontinued':
        return '#d32f2f'
      default:
        return '#666'
    }
  }

  const getPriorityLabel = (priority?: string) => {
    switch (priority) {
      case 'stat':
        return 'STAT'
      case 'urgent':
        return 'URGENT'
      default:
        return 'ROUTINE'
    }
  }

  const orders = patient?.orders || []

  if (tabValue === 5) {
    // Discharge Summary
    return (
      <Paper className={styles.section}>
        <Typography variant="h6" className={styles.sectionTitle}>
          Discharge Summary
        </Typography>
        {patient?.dischargeSummary ? (
          <Box>
            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
              Anticipated Discharge Date
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {new Date(patient.dischargeSummary.anticipatedDate).toLocaleDateString()}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
              Condition at Discharge
            </Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
              {patient.dischargeSummary.condition}
            </Typography>

            <Typography variant="subtitle2" sx={{ fontWeight: 600, color: '#003D82', mt: 2 }}>
              Discharge Instructions
            </Typography>
            <Box component="ul" sx={{ mt: 1 }}>
              {patient.dischargeSummary.instructions.map((instr, idx) => (
                <Typography component="li" variant="body2" key={idx} sx={{ mb: 1 }}>
                  {instr}
                </Typography>
              ))}
            </Box>
          </Box>
        ) : (
          <Box className={styles.emptyState}>
            <Typography>No discharge summary available</Typography>
          </Box>
        )}
      </Paper>
    )
  }

  const type = tabTypes[tabValue]
  const filteredOrders = orders.filter((order) => order.type === type)

  return (
    <Paper className={styles.section}>
      <Typography variant="h6" className={styles.sectionTitle}>
        Orders
      </Typography>

      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={(_, val) => setTabValue(val)} variant="scrollable" scrollButtons="auto">
          {tabs.map((tab) => (
            <Tab key={tab} label={tab} />
          ))}
        </Tabs>
      </Box>

      {filteredOrders.length === 0 ? (
        <Box className={styles.emptyState}>
          <Typography>No {tabs[tabValue].toLowerCase()} orders</Typography>
        </Box>
      ) : (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell sx={{ fontWeight: 600 }}>Order Name</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Details</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Priority</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Status</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Ordered By</TableCell>
                <TableCell sx={{ fontWeight: 600 }}>Date</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order._id}>
                  <TableCell sx={{ fontWeight: 500 }}>{order.name}</TableCell>
                  <TableCell sx={{ color: '#666', fontSize: '0.875rem' }}>{order.details}</TableCell>
                  <TableCell>
                    <Chip
                      label={getPriorityLabel(order.priority)}
                      size="small"
                      sx={{
                        backgroundColor: order.priority === 'stat' ? '#d32f2f' : order.priority === 'urgent' ? '#FF9800' : '#999',
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={order.status}
                      size="small"
                      sx={{
                        backgroundColor: getStatusColor(order.status),
                        color: 'white',
                        fontWeight: 600,
                      }}
                    />
                  </TableCell>
                  <TableCell sx={{ color: '#666' }}>{order.orderedBy}</TableCell>
                  <TableCell sx={{ color: '#999' }}>{new Date(order.date).toLocaleDateString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Paper>
  )
}

export default OrdersTab
