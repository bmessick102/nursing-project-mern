import crypto from 'crypto'
import fileDb from '../utils/fileDb'
import { type InviteCode, type InviteCodeUse } from '../@types'

const COLLECTION = 'inviteCodes'

type ValidationResult =
  | { ok: true; code: InviteCode }
  | { ok: false; reason: 'not_found' | 'inactive' | 'expired' | 'exhausted' }

const readAll = (): InviteCode[] => fileDb.readCollection(COLLECTION) as InviteCode[]
const writeAll = (codes: InviteCode[]) => fileDb.writeCollection(COLLECTION, codes)

// Constant-time string comparison wrapper.
// Buffers must be equal length for timingSafeEqual, so we early-exit on length mismatch.
const timingSafeStringEqual = (a: string, b: string): boolean => {
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

const findByCode = (submittedCode: string): InviteCode | undefined => {
  const normalized = submittedCode.trim()
  if (!normalized) return undefined
  // Iterate all codes; use timing-safe comparison per-entry.
  // Always traverse the full list so total work isn't proportional to where the match sits.
  const codes = readAll()
  let match: InviteCode | undefined
  for (const c of codes) {
    if (timingSafeStringEqual(c.code, normalized) && !match) {
      match = c
    }
  }
  return match
}

const validate = (submittedCode: string): ValidationResult => {
  const code = findByCode(submittedCode)
  if (!code) return { ok: false, reason: 'not_found' }
  if (!code.active) return { ok: false, reason: 'inactive' }
  if (code.expiresAt && new Date(code.expiresAt).getTime() < Date.now()) {
    return { ok: false, reason: 'expired' }
  }
  if (code.maxUses !== null && code.useCount >= code.maxUses) {
    return { ok: false, reason: 'exhausted' }
  }
  return { ok: true, code }
}

const consume = (codeId: string, use: InviteCodeUse): InviteCode | undefined => {
  const codes = readAll()
  const idx = codes.findIndex((c) => c._id === codeId)
  if (idx === -1) return undefined
  const updated: InviteCode = {
    ...codes[idx],
    useCount: codes[idx].useCount + 1,
    usedBy: [...(codes[idx].usedBy || []), use],
  }
  codes[idx] = updated
  writeAll(codes)
  return updated
}

const create = (data: Omit<InviteCode, '_id'>): InviteCode => {
  const codes = readAll()
  const newCode: InviteCode = { ...data, _id: fileDb.generateId() }
  codes.push(newCode)
  writeAll(codes)
  return newCode
}

const findAll = (): InviteCode[] => readAll()

const initializeDefaultCodes = () => {
  const codes = readAll()
  if (codes.length === 0) {
    console.log('🔑 Seeding default invite codes...')
    const now = new Date().toISOString()
    const seeds: Array<Omit<InviteCode, '_id'>> = [
      {
        code: 'CUW-NURS-STU-Z9M4K7P2A8B5',
        role: 'student',
        maxUses: 50,
        useCount: 0,
        createdBy: 'system',
        createdAt: now,
        note: 'Sample student invite — Spring 2026 cohort',
        active: true,
        usedBy: [],
      },
      {
        code: 'CUW-NURS-INS-V8R3L6N5W3D2',
        role: 'instructor',
        maxUses: 10,
        useCount: 0,
        createdBy: 'system',
        createdAt: now,
        note: 'Disabled — instructor accounts are created by an administrator.',
        active: false,
        usedBy: [],
      },
      {
        code: 'CUW-NURS-ADM-Q7X2W5T9B6E1',
        role: 'administrator',
        maxUses: 3,
        useCount: 0,
        createdBy: 'system',
        createdAt: now,
        note: 'Disabled — admin accounts are seeded only.',
        active: false,
        usedBy: [],
      },
    ]
    for (const seed of seeds) create(seed)
    console.log('✅ Seeded 3 default signup invite codes (only student code is active).')
  } else {
    // Defense in depth: even if data file was edited by hand, force admin/instructor
    // signup codes to active:false. Won't touch unrelated codes added by an admin.
    let mutated = false
    const updated = codes.map((c) => {
      if (
        (c.role === 'administrator' || c.role === 'instructor') &&
        c.createdBy === 'system' &&
        c.active
      ) {
        mutated = true
        return {
          ...c,
          active: false,
          note: 'Disabled — non-student signup is administrator-managed only.',
        }
      }
      return c
    })
    if (mutated) {
      fileDb.writeCollection(COLLECTION, updated)
      console.log('⚠️  Deactivated legacy administrator/instructor signup invite codes.')
    }
  }
}

export default {
  findAll,
  findByCode,
  validate,
  consume,
  create,
  initializeDefaultCodes,
}
