import bcrypt from 'bcryptjs'

class Crypt {
  instance: typeof bcrypt = bcrypt

  constructor() {}

  async hash(value: string) {
    const parsed = parseInt(process.env.BCRYPT_ROUNDS ?? '', 10)
    const rounds = Math.min(15, Math.max(10, Number.isNaN(parsed) ? 12 : parsed))
    const salt = await this.instance.genSalt(rounds)
    const hash = await this.instance.hash(value, salt)

    return hash
  }

  async validate(value: string, hash: string) {
    const isOk = await bcrypt.compare(value, hash)

    return isOk
  }
}

export default new Crypt()
