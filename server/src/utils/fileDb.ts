import fs from 'fs'
import path from 'path'
import crypto from 'crypto'
import Database from 'better-sqlite3'

/**
 * SQLite-backed data layer (kept under the historical name `fileDb` so existing
 * models/routes keep importing the same interface). Each "collection" is stored as
 * one row per document `(id, ord, doc)` where `doc` is the JSON record — this gives
 * ACID writes and crash-safe durability (no torn JSON files) without rewriting the
 * document-shaped model logic. WAL mode is enabled for concurrent read durability.
 */

// Legacy JSON location (still used to import pre-existing data on first run).
const DATA_DIR = process.env.DATA_DIR || path.join(__dirname, '../../data')
// SQLite file location. On Railway, point DATABASE_PATH at the mounted volume.
const DB_PATH = process.env.DATABASE_PATH || path.join(DATA_DIR, 'app.db')

// Collections that get a table eagerly + a one-time legacy-JSON import on init.
const KNOWN_COLLECTIONS = ['accounts', 'courses', 'patients', 'inviteCodes']

let db: Database.Database | null = null

const ensureDataDir = () => {
  const dir = path.dirname(DB_PATH)
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true })
  }
}

// Guard against SQL injection via dynamic table names (names are internal, but be safe).
const tableName = (collection: string): string => {
  if (!/^[A-Za-z][A-Za-z0-9_]*$/.test(collection)) {
    throw new Error(`Invalid collection name: ${collection}`)
  }
  return collection
}

const createTable = (collection: string) => {
  const tbl = tableName(collection)
  getDb().exec(
    `CREATE TABLE IF NOT EXISTS ${tbl} (id TEXT PRIMARY KEY, ord INTEGER NOT NULL, doc TEXT NOT NULL)`,
  )
}

const getDb = (): Database.Database => {
  if (db) return db
  ensureDataDir()
  db = new Database(DB_PATH)
  db.pragma('journal_mode = WAL')
  db.pragma('foreign_keys = ON')
  return db
}

const readCollection = (collection: string): any[] => {
  try {
    createTable(collection)
    const tbl = tableName(collection)
    const rows = getDb().prepare(`SELECT doc FROM ${tbl} ORDER BY ord`).all() as {
      doc: string
    }[]
    return rows.map((r) => JSON.parse(r.doc))
  } catch (error) {
    console.error(`Error reading collection ${collection}:`, error)
    return []
  }
}

const writeCollection = (collection: string, data: any[]) => {
  try {
    createTable(collection)
    const tbl = tableName(collection)
    const database = getDb()
    const insert = database.prepare(`INSERT INTO ${tbl} (id, ord, doc) VALUES (?, ?, ?)`)
    const replaceAll = database.transaction((items: any[]) => {
      database.prepare(`DELETE FROM ${tbl}`).run()
      items.forEach((item, index) => {
        const id = String(item?._id ?? generateId())
        insert.run(id, index, JSON.stringify(item))
      })
    })
    replaceAll(data)
  } catch (error) {
    console.error(`Error writing collection ${collection}:`, error)
    throw error
  }
}

const generateId = (): string => crypto.randomUUID()

// One-time migration: for each known collection, if its table is empty and a legacy
// <DATA_DIR>/<collection>.json exists with rows, import it. Safe to run every boot.
const importLegacyJson = () => {
  for (const collection of KNOWN_COLLECTIONS) {
    try {
      createTable(collection)
      const tbl = tableName(collection)
      const count = (
        getDb().prepare(`SELECT COUNT(*) AS n FROM ${tbl}`).get() as { n: number }
      ).n
      if (count > 0) continue

      const legacyPath = path.join(DATA_DIR, `${collection}.json`)
      if (!fs.existsSync(legacyPath)) continue

      const parsed = JSON.parse(fs.readFileSync(legacyPath, 'utf-8'))
      if (Array.isArray(parsed) && parsed.length > 0) {
        writeCollection(collection, parsed)
        console.log(`📦 Imported ${parsed.length} ${collection} from legacy JSON`)
      }
    } catch (error) {
      console.error(`Legacy import failed for ${collection}:`, error)
    }
  }
}

// Called once at startup (from fileStorage.connect): open DB, create tables, migrate.
const init = () => {
  ensureDataDir()
  getDb()
  KNOWN_COLLECTIONS.forEach(createTable)
  importLegacyJson()
}

const getDbPath = (): string => DB_PATH

export default {
  readCollection,
  writeCollection,
  generateId,
  ensureDataDir,
  init,
  importLegacyJson,
  getDbPath,
}
