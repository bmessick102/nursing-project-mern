import React from 'react'
import { NavLink, useMatch } from 'react-router-dom'
import { Drawer, Box, Typography, Divider } from '@mui/material'
import {
  Dashboard,
  People,
  Assessment,
  LocalPharmacy,
  Science,
  FavoriteBorder,
  NoteAlt,
  Assignment,
  Bloodtype,
  AdminPanelSettings,
  Summarize,
  Timeline,
} from '@mui/icons-material'
import { useAppStore } from 'store/useAppStore'
import { useAuth } from 'contexts/AuthContext'
import styles from 'styles/AppShell.module.css'

const SIDEBAR_WIDTH = 240

interface Props {
  open: boolean
  onClose: () => void
  variant: 'permanent' | 'temporary'
}

const CHART_TABS = [
  { label: 'Summary', path: 'summary', icon: <Summarize fontSize="small" /> },
  { label: 'Chart Review', path: 'chart', icon: <Timeline fontSize="small" /> },
  { label: 'Results', path: 'results', icon: <Science fontSize="small" /> },
  { label: 'MAR', path: 'mar', icon: <LocalPharmacy fontSize="small" /> },
  { label: 'Flowsheets', path: 'flowsheets', icon: <FavoriteBorder fontSize="small" /> },
  { label: 'Assessments', path: 'assessments', icon: <Assessment fontSize="small" /> },
  { label: 'I&O', path: 'io', icon: <Bloodtype fontSize="small" /> },
  { label: 'Notes', path: 'notes', icon: <NoteAlt fontSize="small" /> },
  { label: 'Orders', path: 'orders', icon: <Assignment fontSize="small" /> },
]

const Sidebar: React.FC<Props> = ({ open, onClose, variant }) => {
  const { selectedPatient, selectedCourse } = useAppStore()
  const { account } = useAuth()
  const isAdmin = account?.role === 'administrator' || account?.role === 'admin'
  // Chart tabs belong only inside a patient chart — not on the roster, where a
  // previously-selected patient may still linger in the store.
  const inPatientRoute = useMatch('/patient/:patientId/*')

  const content = (
    <Box
      sx={{
        width: SIDEBAR_WIDTH,
        height: '100%',
        bgcolor: '#003D82',
        color: '#fff',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Context header — the CUW logo lives in the top bar, so this shows the
          current course/section context rather than re-branding. */}
      <Box sx={{ p: 2, borderBottom: '1px solid rgba(255,255,255,0.15)', minWidth: 0 }}>
        <Typography
          component="div"
          sx={{
            color: '#FFB81C',
            fontWeight: 700,
            fontSize: '0.72rem',
            textTransform: 'uppercase',
            letterSpacing: '0.12em',
          }}
        >
          {selectedCourse ? 'Current Course' : 'CUW Nursing'}
        </Typography>
        {selectedCourse && (
          <Typography
            component="div"
            sx={{
              color: '#fff',
              fontWeight: 600,
              fontSize: '0.95rem',
              lineHeight: 1.25,
              mt: 0.5,
              wordBreak: 'break-word',
              overflowWrap: 'break-word',
              whiteSpace: 'normal',
            }}
          >
            {selectedCourse.name}
          </Typography>
        )}
      </Box>

      <Box sx={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', py: 1, minWidth: 0 }}>
        {/* Patient chart links — only shown while viewing a patient chart */}
        {inPatientRoute && selectedPatient && (
          <>
            <Typography className={styles.sectionLabel}>Patient Chart</Typography>
            <Box className={styles.patientName} data-phi="true">
              {selectedPatient.name}
            </Box>
            {CHART_TABS.map(({ label, path, icon }) => (
              <NavLink
                key={path}
                to={`/patient/${selectedPatient._id}/${path}`}
                className={({ isActive }) =>
                  isActive ? styles.navLinkActive : styles.navLink
                }
                onClick={variant === 'temporary' ? onClose : undefined}
              >
                {icon} {label}
              </NavLink>
            ))}
            <Divider sx={{ borderColor: 'rgba(255,255,255,0.15)', my: 1 }} />
          </>
        )}

        <Typography className={styles.sectionLabel}>Navigation</Typography>
        <NavLink
          to="/patients"
          className={({ isActive }) =>
            isActive ? styles.navLinkActive : styles.navLink
          }
          onClick={variant === 'temporary' ? onClose : undefined}
        >
          <People fontSize="small" /> Patient Roster
        </NavLink>
        {!selectedCourse && (
          <NavLink
            to="/course-select"
            className={({ isActive }) =>
              isActive ? styles.navLinkActive : styles.navLink
            }
            onClick={variant === 'temporary' ? onClose : undefined}
          >
            <Dashboard fontSize="small" /> Course Select
          </NavLink>
        )}
        {isAdmin && (
          <NavLink
            to="/admin"
            className={({ isActive }) =>
              isActive ? styles.navLinkActive : styles.navLink
            }
            onClick={variant === 'temporary' ? onClose : undefined}
          >
            <AdminPanelSettings fontSize="small" /> Admin Console
          </NavLink>
        )}
      </Box>
    </Box>
  )

  const isPermanent = variant === 'permanent'

  return (
    <Drawer
      variant={variant}
      open={open}
      onClose={onClose}
      sx={{
        width: isPermanent ? (open ? SIDEBAR_WIDTH : 0) : 0,
        flexShrink: 0,
        overflow: 'hidden',
        transition: (theme) =>
          theme.transitions.create('width', {
            easing: theme.transitions.easing.sharp,
            duration: open
              ? theme.transitions.duration.enteringScreen
              : theme.transitions.duration.leavingScreen,
          }),
        '& .MuiDrawer-paper': {
          width: SIDEBAR_WIDTH,
          border: 'none',
          boxSizing: 'border-box',
          overflow: 'hidden',
          position: isPermanent ? 'relative' : 'fixed',
          height: isPermanent ? '100%' : '100vh',
          zIndex: isPermanent ? 'auto' : (theme) => theme.zIndex.drawer,
          transition: (theme) =>
            theme.transitions.create('width', {
              easing: theme.transitions.easing.sharp,
              duration: open
                ? theme.transitions.duration.enteringScreen
                : theme.transitions.duration.leavingScreen,
            }),
        },
      }}
    >
      {content}
    </Drawer>
  )
}

export default Sidebar
