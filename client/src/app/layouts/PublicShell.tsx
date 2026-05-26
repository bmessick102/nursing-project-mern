import React from 'react'
import { Outlet } from 'react-router-dom'
import { Box } from '@mui/material'
import MainHeader from 'app/layouts/MainHeader'
import Footer from 'components/Footer'
import UtilityBar from 'components/UtilityBar'
import IdleSessionTimer from 'components/common/IdleSessionTimer'
import styles from 'styles/AppShell.module.css'

/**
 * Chrome for public / pre-roster pages (Login, Sign Up, Course Selection).
 * Same UtilityBar + MainHeader + Footer as the authenticated AppShell, minus the
 * sidebar — so navigation looks identical everywhere.
 */
const PublicShell: React.FC = () => (
  <Box className={styles.shell}>
    <a href="#main-content" className="skip-link">
      Skip to main content
    </a>

    <IdleSessionTimer />

    <UtilityBar />
    <MainHeader />

    <Box
      component="main"
      id="main-content"
      className={styles.publicMain}
      tabIndex={-1}
    >
      <Outlet />
    </Box>

    <Footer />
  </Box>
)

export default PublicShell
