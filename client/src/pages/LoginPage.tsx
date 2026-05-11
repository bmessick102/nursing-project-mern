import React, { useState } from 'react'
import {
  Box,
  Container,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
  IconButton,
  InputAdornment,
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { useAuth } from 'contexts/AuthContext'
import UtilityBar from 'components/UtilityBar'
import PillarCards from 'components/PillarCards'
import Footer from 'components/Footer'
import styles from 'styles/LoginPage.module.css'

const LoginPage = () => {
  const { login, isLoggedIn } = useAuth()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      await login({ username, password })
    } catch (err: any) {
      setError(err || 'Login failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (isLoggedIn) {
    return null
  }

  return (
    <Box className={styles.pageWrap}>
      <UtilityBar />
      <Box className={styles.loginContainer}>
        <div className={styles.backgroundLeft}></div>
        <div className={styles.backgroundRight}></div>

        <Container maxWidth="md" className={styles.loginContent}>
          <Box className={styles.loginBox}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
              <img
                src="/images/logo.jpg"
                alt="Concordia University Wisconsin · School of Nursing"
                style={{ width: '300px', height: 'auto', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h1" className={styles.title}>
              Epic
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Nursing Charting System
            </Typography>
            <Typography variant="caption" className={styles.featuring}>
              Featuring NursingCare
            </Typography>

            <form onSubmit={handleLogin} className={styles.form}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <TextField
                fullWidth
                label="User ID"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                variant="outlined"
              />

              <TextField
                fullWidth
                label="Password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={loading}
                sx={{ mb: 2 }}
                variant="outlined"
                InputProps={{
                  endAdornment: (
                    <InputAdornment position="end">
                      <IconButton
                        onClick={() => setShowPassword(!showPassword)}
                        edge="end"
                        disabled={loading}
                        aria-label="toggle password visibility"
                      >
                        {showPassword ? <VisibilityOff /> : <Visibility />}
                      </IconButton>
                    </InputAdornment>
                  ),
                }}
              />

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={loading || !username || !password}
                sx={{ padding: '10px' }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Log In'}
              </Button>
            </form>

            <Typography variant="caption" className={styles.footer}>
              Last login: Never
            </Typography>
          </Box>

          <PillarCards />
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

export default LoginPage
