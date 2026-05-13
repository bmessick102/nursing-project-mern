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
  Grid,
  Link as MuiLink,
  Tooltip,
} from '@mui/material'
import { Visibility, VisibilityOff, VpnKey, HelpOutline } from '@mui/icons-material'
import { useAuth } from 'contexts/AuthContext'
import UtilityBar from 'components/UtilityBar'
import Footer from 'components/Footer'
import styles from 'styles/LoginPage.module.css'

interface SignUpPageProps {
  onSwitchToLogin: () => void
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSwitchToLogin }) => {
  const { register, isLoggedIn } = useAuth()

  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  const [email, setEmail] = useState('')
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [inviteCode, setInviteCode] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showCode, setShowCode] = useState(false)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  if (isLoggedIn) {
    return null
  }

  const emailIsValid = email.trim() === '' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())
  const codeIsValidFormat = inviteCode.trim().length >= 8

  const canSubmit =
    !!firstName.trim() &&
    !!lastName.trim() &&
    !!username.trim() &&
    username.trim().length >= 3 &&
    !!password &&
    password.length >= 6 &&
    password === confirmPassword &&
    emailIsValid &&
    codeIsValidFormat &&
    !loading

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (username.trim().length < 3) {
      setError('Username must be at least 3 characters.')
      return
    }
    if (!emailIsValid) {
      setError('Please enter a valid email address (or leave blank).')
      return
    }
    if (!codeIsValidFormat) {
      setError('Please enter your special code.')
      return
    }

    setLoading(true)
    try {
      await register({
        username: username.trim(),
        password,
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        email: email.trim(),
        inviteCode: inviteCode.trim(),
      })
      // On success the AuthContext sets isLoggedIn=true; App will route forward.
    } catch (err: any) {
      setError(err || 'Sign up failed. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Box className={styles.pageWrap}>
      <UtilityBar />
      <Box className={styles.loginContainer}>
        <div className={styles.backgroundLeft}></div>
        <div className={styles.backgroundRight}></div>

        <Container maxWidth="md" className={styles.loginContent}>
          <Box className={styles.loginBox} sx={{ maxWidth: '560px !important' }}>
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 0 }}>
              <img
                src="/images/logo.jpg"
                alt="Concordia University Wisconsin · School of Nursing"
                style={{ width: '240px', height: 'auto', objectFit: 'contain' }}
              />
            </Box>
            <Typography variant="h1" className={styles.title} sx={{ fontSize: '34px !important' }}>
              Create Account
            </Typography>
            <Typography variant="subtitle1" className={styles.subtitle}>
              Nursing Charting System
            </Typography>
            <Typography variant="caption" className={styles.featuring}>
              Join the CUW School of Nursing training environment
            </Typography>

            <form onSubmit={handleSignUp} className={styles.form}>
              {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                  {error}
                </Alert>
              )}

              <Alert
                severity="info"
                icon={<VpnKey fontSize="inherit" />}
                sx={{
                  mb: 1,
                  backgroundColor: '#FFFBF0',
                  color: '#7A4F00',
                  border: '1px solid #FFB81C',
                  '& .MuiAlert-icon': { color: '#7A4F00' },
                }}
              >
                A <strong>special invite code</strong> is required to register. Your instructor or
                administrator will provide one — it determines your access level.
              </Alert>

              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="given-name"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="family-name"
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Email"
                    type="email"
                    placeholder="you@cuw.edu"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="email"
                    error={!emailIsValid}
                    helperText={!emailIsValid ? 'Invalid email format' : ' '}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="User ID"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="username"
                    helperText="3+ characters"
                    required
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="new-password"
                    helperText="6+ characters"
                    required
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
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    fullWidth
                    label="Confirm Password"
                    type={showPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="new-password"
                    error={confirmPassword.length > 0 && confirmPassword !== password}
                    helperText={
                      confirmPassword.length > 0 && confirmPassword !== password
                        ? 'Passwords do not match'
                        : ' '
                    }
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    fullWidth
                    label="Special Code"
                    placeholder="CUW-NURS-..."
                    type={showCode ? 'text' : 'password'}
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                    disabled={loading}
                    variant="outlined"
                    autoComplete="off"
                    required
                    inputProps={{ spellCheck: false, autoCapitalize: 'off' }}
                    helperText="Provided by your instructor or administrator"
                    InputProps={{
                      startAdornment: (
                        <InputAdornment position="start">
                          <VpnKey fontSize="small" sx={{ color: '#003D82' }} />
                        </InputAdornment>
                      ),
                      endAdornment: (
                        <InputAdornment position="end">
                          <Tooltip title="Your administrator distributes these codes. Each code grants a specific access level (Student / Instructor / Administrator).">
                            <IconButton edge="end" size="small" disabled={loading}>
                              <HelpOutline fontSize="small" />
                            </IconButton>
                          </Tooltip>
                          <IconButton
                            onClick={() => setShowCode(!showCode)}
                            edge="end"
                            disabled={loading}
                            aria-label="toggle special code visibility"
                          >
                            {showCode ? <VisibilityOff /> : <Visibility />}
                          </IconButton>
                        </InputAdornment>
                      ),
                    }}
                  />
                </Grid>
              </Grid>

              <Button
                fullWidth
                variant="contained"
                color="primary"
                type="submit"
                disabled={!canSubmit}
                sx={{ padding: '10px', mt: 2 }}
              >
                {loading ? <CircularProgress size={24} color="inherit" /> : 'Create Account'}
              </Button>
            </form>

            <Typography
              variant="body2"
              sx={{ mt: 3, textAlign: 'center', color: '#4A4A4A' }}
            >
              Already have an account?{' '}
              <MuiLink
                component="button"
                type="button"
                onClick={onSwitchToLogin}
                sx={{
                  color: '#003D82',
                  fontWeight: 600,
                  textDecoration: 'none',
                  '&:hover': { textDecoration: 'underline' },
                }}
              >
                Log In
              </MuiLink>
            </Typography>

            <Typography variant="caption" className={styles.footer}>
              CUW School of Nursing · Training Environment
            </Typography>
          </Box>
        </Container>
      </Box>
      <Footer />
    </Box>
  )
}

export default SignUpPage
