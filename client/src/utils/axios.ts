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

export default axios
