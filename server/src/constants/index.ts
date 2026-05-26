const isProd = process.env.NODE_ENV === 'production'

// Comma-separated list of allowed browser origins (the Vercel frontend URL, plus
// any preview/localhost origins). Falls back to local dev origins when unset.
const ORIGIN = process.env.CORS_ORIGIN
  ? process.env.CORS_ORIGIN.split(',')
      .map((o) => o.trim())
      .filter(Boolean)
  : ['http://localhost:3000', 'http://localhost:3001']

const PORT = parseInt(process.env.PORT || '5001', 10)

const JWT_SECRET = process.env.JWT_SECRET || ''

// Secrets that must never be used to sign real tokens.
const UNSAFE_SECRETS = [
  'unsafe_secret',
  'your-secret-key-change-in-production',
  'change-me',
  'secret',
]

// Fail fast: a missing or placeholder JWT secret lets anyone forge tokens.
if (!JWT_SECRET) {
  throw new Error(
    'JWT_SECRET is required but not set. Add it to the environment (Railway env / .env) before starting the server.',
  )
}

if (isProd && UNSAFE_SECRETS.includes(JWT_SECRET)) {
  throw new Error(
    'JWT_SECRET is set to an insecure placeholder. Generate a strong, unique secret for production.',
  )
}

export { ORIGIN, PORT, JWT_SECRET }
