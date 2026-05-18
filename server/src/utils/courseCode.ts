import crypto from 'crypto'

/**
 * Generate a human-readable course join code with a cryptographically random tail.
 * Example output:  "NURS-201-7K3X9P"
 *
 * The tail uses Crockford Base32 (no 0/O/I/L confusion) so students can read it
 * off a whiteboard without ambiguity.
 */
const TAIL_ALPHABET = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ' // 32 chars, omits 0,1,I,O

const randomTail = (len = 6): string => {
  const bytes = crypto.randomBytes(len)
  let out = ''
  for (let i = 0; i < len; i++) {
    out += TAIL_ALPHABET[bytes[i] % TAIL_ALPHABET.length]
  }
  return out
}

export const generateCourseCode = (courseShortCode: string): string => {
  const cleanShort = (courseShortCode || 'COURSE')
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, '')
    .slice(0, 8)
  return `${cleanShort}-${randomTail(6)}`
}

/**
 * Constant-time string comparison for matching invite codes.
 * Same defense-in-depth pattern used for signup invite codes.
 */
export const timingSafeCodeEqual = (a: string, b: string): boolean => {
  if (typeof a !== 'string' || typeof b !== 'string') return false
  const bufA = Buffer.from(a, 'utf8')
  const bufB = Buffer.from(b, 'utf8')
  if (bufA.length !== bufB.length) return false
  try {
    return crypto.timingSafeEqual(bufA, bufB)
  } catch {
    return false
  }
}
