import { useEffect, useRef } from 'react'
import { useAuth } from 'contexts/AuthContext'
import { useSnackbar } from 'contexts/SnackbarContext'

/**
 * HIPAA §164.312(a)(2)(iii) "Automatic logoff" — terminate an electronic session
 * after a predetermined time of inactivity.
 *
 * Industry norm in inpatient EHR is 15 minutes; outpatient is often 30. We use 15.
 * A 1-minute "you'll be signed out soon" warning fires at 14:00.
 *
 * Activity events that reset the timer: mousemove, keydown, click, scroll, touchstart.
 */
const IDLE_LIMIT_MS = 15 * 60 * 1000
const WARN_MS = 14 * 60 * 1000

const IdleSessionTimer: React.FC = () => {
  const { isLoggedIn, logout } = useAuth()
  const { notifyInfo, notifyError } = useSnackbar()
  const warnTimer = useRef<number | null>(null)
  const logoutTimer = useRef<number | null>(null)

  useEffect(() => {
    if (!isLoggedIn) return

    const clearTimers = () => {
      if (warnTimer.current) window.clearTimeout(warnTimer.current)
      if (logoutTimer.current) window.clearTimeout(logoutTimer.current)
    }

    const reset = () => {
      clearTimers()
      warnTimer.current = window.setTimeout(() => {
        notifyInfo('You will be signed out in 1 minute due to inactivity.')
      }, WARN_MS)
      logoutTimer.current = window.setTimeout(() => {
        logout()
        notifyError('Signed out due to 15 minutes of inactivity.')
      }, IDLE_LIMIT_MS)
    }

    const events = ['mousemove', 'keydown', 'click', 'scroll', 'touchstart'] as const
    events.forEach((ev) => window.addEventListener(ev, reset, { passive: true }))
    reset()

    return () => {
      clearTimers()
      events.forEach((ev) => window.removeEventListener(ev, reset))
    }
  }, [isLoggedIn, logout, notifyInfo, notifyError])

  return null
}

export default IdleSessionTimer
