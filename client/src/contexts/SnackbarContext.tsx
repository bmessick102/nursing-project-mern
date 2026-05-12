import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type PropsWithChildren,
} from 'react'
import { Snackbar, Alert, type AlertColor } from '@mui/material'

interface SnackbarMessage {
  key: number
  message: string
  severity: AlertColor
}

interface SnackbarContextValue {
  notify: (message: string, severity?: AlertColor) => void
  notifyError: (message: string) => void
  notifySuccess: (message: string) => void
  notifyInfo: (message: string) => void
}

const SnackbarContext = createContext<SnackbarContextValue>({
  notify: () => {},
  notifyError: () => {},
  notifySuccess: () => {},
  notifyInfo: () => {},
})

export const useSnackbar = () => useContext(SnackbarContext)

export const SnackbarProvider: React.FC<PropsWithChildren> = ({ children }) => {
  const [current, setCurrent] = useState<SnackbarMessage | null>(null)

  const notify = useCallback((message: string, severity: AlertColor = 'info') => {
    setCurrent({ key: Date.now(), message, severity })
  }, [])

  const value = useMemo<SnackbarContextValue>(
    () => ({
      notify,
      notifyError: (m: string) => notify(m, 'error'),
      notifySuccess: (m: string) => notify(m, 'success'),
      notifyInfo: (m: string) => notify(m, 'info'),
    }),
    [notify],
  )

  return (
    <SnackbarContext.Provider value={value}>
      {children}
      <Snackbar
        key={current?.key}
        open={current !== null}
        autoHideDuration={4500}
        onClose={() => setCurrent(null)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        {current ? (
          <Alert
            onClose={() => setCurrent(null)}
            severity={current.severity}
            variant="filled"
            sx={{ width: '100%' }}
          >
            {current.message}
          </Alert>
        ) : undefined}
      </Snackbar>
    </SnackbarContext.Provider>
  )
}
