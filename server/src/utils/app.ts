import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import rateLimit from 'express-rate-limit'
import pinoHttp from 'pino-http'
import logger from './logger'
import { ORIGIN } from '../constants/index'

// initialize app
const app = express()

// Behind Railway/Vercel proxies. Trust the first proxy hop so req.ip reflects the
// real client IP (X-Forwarded-For) and rate limiters key on the actual caller.
app.set('trust proxy', 1)

// Structured request logging. Skip the noisy health check.
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/healthz' },
  }),
)

// middlewares
// Security headers. CSP runs in REPORT-ONLY mode for now: the policy is delivered
// but never blocks, so we can verify no violations before promoting it to enforcing.
// All other helmet protections (HSTS, nosniff, frameguard, etc.) stay on.
app.use(
  helmet({
    contentSecurityPolicy: {
      useDefaults: true,
      reportOnly: true,
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
        fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
        imgSrc: ["'self'", 'data:'],
        connectSrc: ["'self'", 'https://nursing-project-mern-production.up.railway.app'],
        frameAncestors: ["'none'"],
        objectSrc: ["'none'"],
        baseUri: ["'self'"],
        formAction: ["'self'"],
      },
    },
  }),
)

// Helmet v8 does not set Permissions-Policy; lock down powerful features we never use.
app.use((_req, res, next) => {
  res.setHeader(
    'Permissions-Policy',
    'geolocation=(), microphone=(), camera=(), payment=(), usb=()',
  )
  next()
})

// ORIGIN is an allowlist (array). Requests with no Origin header (curl, server-to-server,
// same-origin) are permitted; browser requests from unlisted origins are blocked.
app.use(cors({ origin: ORIGIN }))
// Bound request bodies. Charting payloads carry nested arrays, so allow headroom
// while still rejecting absurd/abusive bodies.
app.use(express.json({ limit: '256kb' })) // body parser
app.use(express.urlencoded({ extended: false, limit: '256kb' })) // url parser

// Generous global rate limit. Sits well above normal charting usage but caps
// abusive/automated traffic. Auth routes keep their own stricter limiters.
app.use(
  rateLimit({
    windowMs: 60_000,
    max: 300,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: 'Too many requests, please slow down.' },
  }),
)

export default app
