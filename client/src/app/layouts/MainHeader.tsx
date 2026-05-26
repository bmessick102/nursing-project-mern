import React, { useState, useEffect } from 'react'
import { useNavigate, useMatch, useLocation } from 'react-router-dom'
import {
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  Box,
  Tooltip,
  Menu,
  MenuItem,
  Divider,
  Button,
  ButtonBase,
} from '@mui/material'
import {
  Menu as MenuIcon,
  VisibilityOff,
  Visibility,
  AccountCircle,
} from '@mui/icons-material'
import { useAuth } from 'contexts/AuthContext'
import { useAppStore } from 'store/useAppStore'
import { useCurrentUser } from 'hooks/useCurrentUser'
import OnlineIndicator from 'components/OnlineIndicator'

interface Props {
  // Provided only inside AppShell, where a collapsible sidebar exists.
  onMenuToggle?: () => void
}

const CUW_NAVY = '#003D82'

/**
 * Unified CUW header used on every page (public + authenticated). Mirrors the
 * cuw.edu top header: a white bar with the CUW logo at left and context-aware
 * actions at right. Adapts to auth state so the same chrome works everywhere.
 */
const MainHeader: React.FC<Props> = ({ onMenuToggle }) => {
  const { isLoggedIn, logout } = useAuth()
  const {
    setSelectedCourse,
    setSelectedPatient,
    selectedPatient,
    selectedCourse,
  } = useAppStore()
  const { displayName, roleLabel } = useCurrentUser()
  const navigate = useNavigate()
  const location = useLocation()
  const inPatientRoute = useMatch('/patient/:patientId/*')

  // Privacy mode — always starts off; resets each session (shared lab computers).
  const [privacyMode, setPrivacyMode] = useState(false)
  useEffect(() => {
    document.body.classList.toggle('privacy-mode', privacyMode)
  }, [privacyMode])

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null)

  const handleLogout = () => {
    logout()
    setSelectedCourse(null)
    setSelectedPatient(null)
    navigate('/login', { replace: true })
    setAnchorEl(null)
  }

  const onSignupPage = location.pathname === '/signup'

  return (
    <AppBar
      position="sticky"
      elevation={0}
      sx={{
        bgcolor: '#fff',
        color: 'text.primary',
        borderBottom: '3px solid',
        borderColor: 'secondary.main',
        boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
        zIndex: (theme) => theme.zIndex.drawer + 1,
      }}
    >
      <Toolbar sx={{ gap: 1.5, minHeight: { xs: 60, sm: 68 } }}>
        {onMenuToggle && (
          <IconButton
            edge="start"
            onClick={onMenuToggle}
            aria-label="toggle navigation"
            sx={{ color: CUW_NAVY }}
          >
            <MenuIcon />
          </IconButton>
        )}

        {/* Brand — logo + app title, links home */}
        <ButtonBase
          onClick={() => navigate('/')}
          aria-label="Home"
          sx={{ display: 'flex', alignItems: 'center', gap: 1.5, borderRadius: 1, p: 0.5 }}
        >
          <Box
            component="img"
            src="/images/logo.jpg"
            alt="Concordia University Wisconsin — School of Nursing"
            sx={{ height: { xs: 34, sm: 40 }, width: 'auto', display: 'block' }}
          />
          <Divider
            orientation="vertical"
            flexItem
            sx={{ display: { xs: 'none', md: 'block' }, my: 1.25 }}
          />
          <Typography
            component="span"
            sx={{
              display: { xs: 'none', md: 'block' },
              color: CUW_NAVY,
              fontWeight: 700,
              textTransform: 'uppercase',
              letterSpacing: '0.1em',
              fontSize: '0.8rem',
              whiteSpace: 'nowrap',
            }}
          >
            Nursing Charting
          </Typography>
        </ButtonBase>

        {/* Patient context — only inside a patient chart */}
        {inPatientRoute && selectedPatient && (
          <Box
            sx={{
              ml: { xs: 1, sm: 2 },
              px: 1.5,
              py: 0.5,
              borderLeft: '4px solid',
              borderColor: 'secondary.main',
              borderRadius: '0 4px 4px 0',
              bgcolor: 'rgba(0, 61, 130, 0.06)',
              minWidth: 0,
              display: { xs: 'none', sm: 'block' },
            }}
          >
            <Typography
              data-phi="true"
              noWrap
              sx={{
                fontWeight: 800,
                color: CUW_NAVY,
                fontSize: '1.05rem',
                lineHeight: 1.2,
              }}
            >
              {selectedPatient.name}
            </Typography>
            <Typography
              noWrap
              component="div"
              sx={{
                fontSize: '0.72rem',
                fontWeight: 700,
                color: 'text.secondary',
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}
            >
              Room {selectedPatient.roomNumber} · {selectedCourse?.name}
            </Typography>
          </Box>
        )}

        <Box sx={{ flex: 1 }} />

        {/* Right-side actions */}
        {isLoggedIn ? (
          <>
            <Tooltip title={privacyMode ? 'Privacy mode on' : 'Privacy mode off'}>
              <IconButton
                onClick={() => setPrivacyMode((p) => !p)}
                size="small"
                aria-pressed={privacyMode}
                aria-label="toggle privacy mode"
                sx={{ color: CUW_NAVY }}
              >
                {privacyMode ? (
                  <VisibilityOff fontSize="small" />
                ) : (
                  <Visibility fontSize="small" />
                )}
              </IconButton>
            </Tooltip>

            <OnlineIndicator online={isLoggedIn}>
              <IconButton
                onClick={(e) => setAnchorEl(e.currentTarget)}
                aria-label="account menu"
                sx={{ color: CUW_NAVY }}
              >
                <AccountCircle />
              </IconButton>
            </OnlineIndicator>

            <Menu
              anchorEl={anchorEl}
              open={Boolean(anchorEl)}
              onClose={() => setAnchorEl(null)}
            >
              <MenuItem disabled>
                <Box>
                  <Typography variant="body2" fontWeight={700}>
                    {displayName}
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    {roleLabel}
                  </Typography>
                </Box>
              </MenuItem>
              <Divider />
              <MenuItem onClick={handleLogout}>Sign Out</MenuItem>
            </Menu>
          </>
        ) : (
          <Button
            onClick={() => navigate(onSignupPage ? '/login' : '/signup')}
            variant="outlined"
            color="primary"
            size="small"
          >
            {onSignupPage ? 'Sign In' : 'Create Account'}
          </Button>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default MainHeader
