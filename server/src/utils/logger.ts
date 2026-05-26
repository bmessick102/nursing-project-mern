import pino from 'pino'

/**
 * App-wide structured logger. Emits JSON to stdout (Railway captures it). Level is
 * controlled by LOG_LEVEL (defaults: info in production, debug otherwise).
 */
const logger = pino({
  level: process.env.LOG_LEVEL || (process.env.NODE_ENV === 'production' ? 'info' : 'debug'),
  // Never log credentials/tokens if an object carrying them is ever passed in.
  redact: ['req.headers.authorization', 'password', '*.password'],
})

export default logger
