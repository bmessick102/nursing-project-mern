import fileDb from './fileDb'

class FileStorage {
  isConnected: boolean

  constructor() {
    this.isConnected = false
  }

  async connect() {
    try {
      console.log('⏳ Initializing SQLite storage')
      fileDb.init()
      this.isConnected = true
      console.log('✅ SQLite storage initialized')
    } catch (error: any) {
      console.log('❌ Storage error:', error.message)
    }
  }
}

export default new FileStorage()
