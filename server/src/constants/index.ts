const ORIGIN = '*'
const PORT = parseInt(process.env.PORT || '3002', 10)

const JWT_SECRET = process.env.JWT_SECRET || 'unsafe_secret'

export { ORIGIN, PORT, JWT_SECRET }
