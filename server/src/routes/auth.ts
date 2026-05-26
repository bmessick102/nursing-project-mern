import express from 'express'
import rateLimit from 'express-rate-limit'
import checkBearerToken from '../middlewares/check-bearer-token'
import errorHandler from '../middlewares/error-handler'
import register from '../controllers/auth/register'
import login from '../controllers/auth/login'
import loginWithToken from '../controllers/auth/login-with-token'

// initialize router
const router = express.Router()

// Throttle credential-accepting endpoints to blunt brute-force / credential-stuffing.
// 10 attempts per IP per 15 minutes; successful requests still count (simple + safe).
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: 'Too many attempts. Please try again in a few minutes.' },
})

// POST at route: /auth/register
router.post('/register', [authLimiter], register, errorHandler)

// POST at path: /auth/login
router.post('/login', [authLimiter], login, errorHandler)

// GET at path: /auth/login (token refresh)
router.get('/login', [checkBearerToken], loginWithToken, errorHandler)

export default router
