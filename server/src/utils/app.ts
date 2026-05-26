import express from 'express'
import cors from 'cors'
import helmet from 'helmet'
import pinoHttp from 'pino-http'
import logger from './logger'
import { ORIGIN } from '../constants/index'

// initialize app
const app = express()

// Structured request logging. Skip the noisy health check.
app.use(
  pinoHttp({
    logger,
    autoLogging: { ignore: (req) => req.url === '/healthz' },
  }),
)

// middlewares
// Security headers. CSP is left off for now because the same Express process can
// serve the CRA build (which uses inline bootstrap script); enabling a strict CSP
// is tracked as future hardening. All other helmet protections stay on.
app.use(helmet({ contentSecurityPolicy: false }))

// ORIGIN is an allowlist (array). Requests with no Origin header (curl, server-to-server,
// same-origin) are permitted; browser requests from unlisted origins are blocked.
app.use(cors({ origin: ORIGIN }))
// Bound request bodies. Charting payloads carry nested arrays, so allow headroom
// while still rejecting absurd/abusive bodies.
app.use(express.json({ limit: '256kb' })) // body parser
app.use(express.urlencoded({ extended: false, limit: '256kb' })) // url parser

export default app
