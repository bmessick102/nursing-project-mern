import React from 'react'
import ReactDOM from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { AuthProvider } from 'contexts/AuthContext'
import { SnackbarProvider } from 'contexts/SnackbarContext'
import ErrorBoundary from 'components/common/ErrorBoundary'
import AppRoutes from 'app/routes/AppRoutes'
import theme from 'theme/theme'
import 'styles/index.css'

const element = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(element)

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <ErrorBoundary>
        <SnackbarProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </SnackbarProvider>
      </ErrorBoundary>
    </ThemeProvider>
  </React.StrictMode>
)
