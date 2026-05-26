import React, { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Box, useTheme, useMediaQuery } from '@mui/material'
import Sidebar from 'app/layouts/Sidebar'
import MainHeader from 'app/layouts/MainHeader'
import Footer from 'components/Footer'
import UtilityBar from 'components/UtilityBar'
import IdleSessionTimer from 'components/common/IdleSessionTimer'
import styles from 'styles/AppShell.module.css'

const AppShell: React.FC = () => {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('md'))
  const [sidebarOpen, setSidebarOpen] = useState(!isMobile)

  return (
    <Box className={styles.shell}>
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      <IdleSessionTimer />

      {/* Full-width top navigation — identical to the public pages */}
      <UtilityBar />
      <MainHeader onMenuToggle={() => setSidebarOpen((prev) => !prev)} />

      {/* Sidebar + page content */}
      <Box className={styles.body}>
        <Sidebar
          open={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
          variant={isMobile ? 'temporary' : 'permanent'}
        />

        <Box
          component="main"
          id="main-content"
          className={styles.mainContent}
          tabIndex={-1}
          sx={{ minWidth: 0 }}
        >
          <Box className={styles.contentArea}>
            <Outlet />
          </Box>
        </Box>
      </Box>

      <Footer />
    </Box>
  )
}

export default AppShell
