// Must be first: load .env before reading process.env below.
import 'dotenv/config'

import fs from 'fs'
import path from 'path'
import Database from 'better-sqlite3'

/**
 * Creates a timestamped, crash-consistent copy of the SQLite database using
 * better-sqlite3's online backup API (safe to run while the server is live).
 * Keeps the most recent BACKUP_KEEP files and prunes the rest.
 *
 * Run on a schedule (Railway scheduled job / cron):  npm run backup
 */
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data')
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'app.db')
const BACKUP_DIR = process.env.BACKUP_DIR || path.join(path.dirname(DB_PATH), 'backups')
const KEEP = parseInt(process.env.BACKUP_KEEP || '14', 10)

const run = async () => {
  if (!fs.existsSync(DB_PATH)) {
    console.error(`No database found at ${DB_PATH} — nothing to back up.`)
    process.exit(1)
  }

  fs.mkdirSync(BACKUP_DIR, { recursive: true })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  const dest = path.join(BACKUP_DIR, `app-${stamp}.db`)

  const db = new Database(DB_PATH, { readonly: true })
  await db.backup(dest)
  db.close()
  console.log(`✅ Backup written: ${dest}`)

  // Prune oldest, keeping the newest KEEP backups.
  const backups = fs
    .readdirSync(BACKUP_DIR)
    .filter((f) => f.startsWith('app-') && f.endsWith('.db'))
    .sort()
  const excess = backups.slice(0, Math.max(0, backups.length - KEEP))
  for (const f of excess) {
    fs.rmSync(path.join(BACKUP_DIR, f), { force: true })
    console.log(`🗑️  Pruned old backup: ${f}`)
  }
}

run().catch((err) => {
  console.error('❌ Backup failed:', err)
  process.exit(1)
})
