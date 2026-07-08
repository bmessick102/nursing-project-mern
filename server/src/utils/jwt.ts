import jsonwebtoken from 'jsonwebtoken'
import { JWT_SECRET } from '../constants/index'

class JWT {
  instance: typeof jsonwebtoken = jsonwebtoken
  secret: string

  constructor() {
    this.secret = JWT_SECRET
  }

  signToken(payload: Record<string, any>, expiresIn: jsonwebtoken.SignOptions['expiresIn'] = '12h') {
    const token = this.instance.sign(payload, JWT_SECRET, { expiresIn, algorithm: 'HS256' })

    return token
  }

  verifyToken(token: string) {
    const auth = this.instance.verify(token, JWT_SECRET, { algorithms: ['HS256'] })

    return auth
  }
}

export default new JWT()
