import React from 'react'
import { Box, Button, Typography } from '@mui/material'

interface Props {
  children: React.ReactNode
}

interface State {
  hasError: boolean
}

/**
 * Catches render-time crashes anywhere below it so a single broken component shows
 * a recoverable fallback instead of white-screening the whole app.
 */
class ErrorBoundary extends React.Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  componentDidCatch(error: unknown, info: unknown) {
    // Surfaced in the browser console (and any future error-reporting hook).
    console.error('Unhandled UI error:', error, info)
  }

  handleReload = () => {
    this.setState({ hasError: false })
    window.location.assign('/')
  }

  render() {
    if (!this.state.hasError) return this.props.children

    return (
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          p: 3,
          textAlign: 'center',
          bgcolor: '#f5f5f5',
        }}
      >
        <Typography variant="h5" sx={{ fontWeight: 700, color: '#003D82' }}>
          Something went wrong
        </Typography>
        <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 480 }}>
          The page hit an unexpected error. Your saved data is safe. Try returning to
          the home screen.
        </Typography>
        <Button variant="contained" onClick={this.handleReload} sx={{ mt: 1 }}>
          Return to home
        </Button>
      </Box>
    )
  }
}

export default ErrorBoundary
