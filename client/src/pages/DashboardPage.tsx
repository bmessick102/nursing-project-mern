import React, { useState } from 'react'
import {
  Box,
  Container,
  Tabs,
  Tab,
  Paper,
  Button,
  Typography,
} from '@mui/material'
import { ChevronRight, Home } from '@mui/icons-material'
import { useAppStore } from 'store/useAppStore'
import SummaryTab from 'components/tabs/SummaryTab'
import ChartReviewTab from 'components/tabs/ChartReviewTab'
import ResultsTab from 'components/tabs/ResultsTab'
import MARTab from 'components/tabs/MARTab'
import FlowsheetsTab from 'components/tabs/FlowsheetsTab'
import AssessmentsTab from 'components/tabs/AssessmentsTab'
import IOTab from 'components/tabs/IOTab'
import NotesTab from 'components/tabs/NotesTab'
import OrdersTab from 'components/tabs/OrdersTab'
import UtilityBar from 'components/UtilityBar'
import Footer from 'components/Footer'
import styles from 'styles/DashboardPage.module.css'

interface DashboardPageProps {
  onLogout: () => void
  onChangePatient: () => void
}

const DashboardPage: React.FC<DashboardPageProps> = ({
  onLogout,
  onChangePatient,
}) => {
  const { selectedPatient, selectedCourse } = useAppStore()
  const [tabValue, setTabValue] = useState(0)

  const tabs = [
    { label: 'Summary', component: SummaryTab },
    { label: 'Chart Review', component: ChartReviewTab },
    { label: 'Results', component: ResultsTab },
    { label: 'MAR', component: MARTab },
    { label: 'Flowsheets', component: FlowsheetsTab },
    { label: 'Assessments', component: AssessmentsTab },
    { label: 'I&O', component: IOTab },
    { label: 'Notes', component: NotesTab },
    { label: 'Orders', component: OrdersTab },
  ]

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue)
  }

  const CurrentTabComponent = tabs[tabValue].component

  return (
    <Box className={styles.dashboardContainer}>
      <UtilityBar
        showLogout
        onLogout={onLogout}
        onChangePatient={onChangePatient}
      />

      <Box className={styles.topBar}>
        <Container maxWidth="xl" className={styles.topBarInner}>
          <Box className={styles.brand}>
            <img
              src="/images/logo.jpg"
              alt="CUW · School of Nursing"
              className={styles.brandLogo}
            />
          </Box>
          <Box className={styles.patientInfo}>
            <Typography component="span" className={styles.patientEyebrow}>
              Active Patient
            </Typography>
            <Typography
              component="h1"
              variant="h6"
              className={styles.patientName}
              data-phi="true"
            >
              {selectedPatient?.name}
            </Typography>
            <Typography variant="body2" className={styles.patientDetails}>
              Room <span data-phi="true">{selectedPatient?.roomNumber}</span> • {selectedCourse?.name}
            </Typography>
          </Box>
          <Box className={styles.actions}>
            <Button
              size="small"
              onClick={onChangePatient}
              className={styles.actionButton}
            >
              Change Patient
            </Button>
            <Button
              size="small"
              onClick={onLogout}
              className={styles.actionButtonPrimary}
            >
              Sign Out
            </Button>
          </Box>
        </Container>
      </Box>

      <Container maxWidth="xl">
        <Box className={styles.breadcrumb}>
          <Home fontSize="inherit" sx={{ fontSize: 14 }} />
          <span className={styles.breadcrumbItem}>School of Nursing</span>
          <ChevronRight sx={{ fontSize: 14, color: '#6B6B6B' }} />
          <span className={styles.breadcrumbItem}>{selectedCourse?.name}</span>
          <ChevronRight sx={{ fontSize: 14, color: '#6B6B6B' }} />
          <span className={styles.breadcrumbCurrent}>
            {selectedPatient?.name}
          </span>
        </Box>
      </Container>

      <Container maxWidth="xl" className={styles.mainContent}>
        <Paper className={styles.tabsContainer}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            variant="scrollable"
            scrollButtons="auto"
            className={styles.tabs}
          >
            {tabs.map((tab, idx) => (
              <Tab key={idx} label={tab.label} />
            ))}
          </Tabs>
        </Paper>

        <Box className={styles.tabContent}>
          <CurrentTabComponent patient={selectedPatient} />
        </Box>
      </Container>

      <Footer />
    </Box>
  )
}

export default DashboardPage
