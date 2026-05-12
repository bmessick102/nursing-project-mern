import React from 'react'
import ReactDOM from 'react-dom/client'
import CssBaseline from '@mui/material/CssBaseline'
import { ThemeProvider } from '@mui/material/styles'
import { AuthProvider } from 'contexts/AuthContext'
import { SnackbarProvider } from 'contexts/SnackbarContext'
import App from 'App'
import theme from 'theme/theme'
import 'styles/index.css'

const element = document.getElementById('root') as HTMLElement
const root = ReactDOM.createRoot(element)

root.render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <SnackbarProvider>
        <AuthProvider>
          <CssBaseline />
          <App />
        </AuthProvider>
      </SnackbarProvider>
    </ThemeProvider>
  </React.StrictMode>
)
