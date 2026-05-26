import React, { createContext, useContext, useState, useEffect, useRef, type PropsWithChildren, useMemo } from 'react'
import axios from 'utils/axios'
import { type FormData, type RegisterData, type Account } from '@types'

interface Context {
  token: string | null
  account: Account | null
  isLoggedIn: boolean
  initializing: boolean
  register: (payload: RegisterData) => Promise<any>
  login: (payload: FormData) => Promise<any>
  logout: () => void
}

const initContext: Context = {
  token: null,
  account: null,
  isLoggedIn: false,
  initializing: true,
  register: async () => {},
  login: async () => {},
  logout: () => {},
}

// init context
const AuthContext = createContext(initContext)
const { Provider } = AuthContext

// export the consumer
export const useAuth = () => useContext(AuthContext)

// export the provider
export const AuthProvider = ({ children }: PropsWithChildren) => {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem('token'))
  const [account, setAccount] = useState(initContext.account)
  const [isLoggedIn, setIsLoggedIn] = useState(initContext.isLoggedIn)
  const [initializing, setInitializing] = useState(() => !!localStorage.getItem('token'))
  const loginInFlight = useRef(false)

  const register = (formData: RegisterData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/register', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData)
          setToken(accessToken)
          setIsLoggedIn(true)
          resolve(true)
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message)
        })
    })
  }

  const login = (formData: FormData) => {
    return new Promise((resolve, reject) => {
      axios
        .post('/auth/login', formData)
        .then(({ data: { data: accountData, token: accessToken } }) => {
          setAccount(accountData)
          setToken(accessToken)
          setIsLoggedIn(true)
          resolve(true)
        })
        .catch((error) => {
          reject(error?.response?.data?.message || error.message)
        })
    })
  }

  const logout = () => {
    setIsLoggedIn(false)
    setAccount(null)
    setToken(null)
    localStorage.removeItem('token')
  }

  const loginWithToken = async () => {
    if (loginInFlight.current) return
    loginInFlight.current = true
    try {
      const {
        data: { data: accountData, token: accessToken },
      } = await axios.get('/auth/login', {
        headers: {
          authorization: `Bearer ${token}`,
        },
      })

      setAccount(accountData)
      setToken(accessToken)
      setIsLoggedIn(true)
    } catch (error: any) {
      console.error(error)
      if (error?.response?.status === 401) setToken(null)
    } finally {
      loginInFlight.current = false
      setInitializing(false)
    }
  }

  // This side effect keeps local storage updated with recent token value
  useEffect(() => {
    if (token) {
      localStorage.setItem('token', token)
    } else {
      localStorage.removeItem('token')
    }
  }, [token])

  // If no token on mount, immediately complete initialization
  useEffect(() => {
    if (!token) setInitializing(false)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // This side effect runs only if we have a token, but no account or logged-in boolean.
  // This "if" statement is "true" only when refreshed, or re-opened the browser,
  // if true, it will then ask the backend for the account information (and will get them if the token hasn't expired)
  useEffect(() => {
    if (!isLoggedIn && !account && token) loginWithToken()
  }, [isLoggedIn, account, token]) // eslint-disable-line react-hooks/exhaustive-deps

  // Cross-tab logout sync: when another tab/window clears the token (logout),
  // propagate the logged-out state here so all open tabs stay consistent.
  useEffect(() => {
    const handleStorage = (e: StorageEvent) => {
      if (e.key === 'token' && e.newValue === null) {
        setIsLoggedIn(false)
        setAccount(null)
        setToken(null)
      }
    }
    window.addEventListener('storage', handleStorage)
    return () => window.removeEventListener('storage', handleStorage)
  }, [])

  const value = useMemo(() => ({ token, account, isLoggedIn, initializing, register, login, logout }), [token, account, isLoggedIn, initializing])

  return <Provider value={value}>{children}</Provider>
}
