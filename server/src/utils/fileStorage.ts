import fileDb from './fileDb'

class FileStorage {
  isConnected: boolean

  constructor() {
    this.isConnected = false
  }

  async connect() {
    try {
      console.log('⏳ Initializing file-based storage')
      fileDb.ensureDataDir()
      this.isConnected = true
      console.log('✅ File storage initialized')
    } catch (error: any) {
      console.log('❌ File storage error:', error.message)
    }
  }
}

export default new FileStorage()
