import fs from 'fs'
import path from 'path'

const DATA_DIR = path.join(__dirname, '../../data')

const ensureDataDir = () => {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true })
  }
}

const getFilePath = (collection: string) => {
  ensureDataDir()
  return path.join(DATA_DIR, `${collection}.json`)
}

const readCollection = (collection: string) => {
  try {
    const filePath = getFilePath(collection)
    if (!fs.existsSync(filePath)) {
      return []
    }
    const data = fs.readFileSync(filePath, 'utf-8')
    return JSON.parse(data) || []
  } catch (error) {
    console.error(`Error reading collection ${collection}:`, error)
    return []
  }
}

const writeCollection = (collection: string, data: any[]) => {
  try {
    const filePath = getFilePath(collection)
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8')
  } catch (error) {
    console.error(`Error writing collection ${collection}:`, error)
    throw error
  }
}

const generateId = () => {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9)
}

export default {
  readCollection,
  writeCollection,
  generateId,
  ensureDataDir,
}
