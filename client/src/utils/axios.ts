import Axios from 'axios'
import { BACKEND_URL } from '../constants'

const axios = Axios.create({
  baseURL: BACKEND_URL,
})

// Add token to every request
axios.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Global 401 handling: if a request fails with 401 while we hold a token, the
// session has expired/been revoked — clear it and bounce to login. The token
// guard means bad-credential 401s on the login screen (no token yet) fall
// through to the form's own error handling instead of forcing a redirect.
axios.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token')
      if (window.location.pathname !== '/login') {
        window.location.assign('/login')
      }
    }
    return Promise.reject(error)
  }
)

export default axios
