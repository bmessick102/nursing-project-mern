import { type RequestHandler } from 'express'
import jwt from '../../utils/jwt'
import Account from '../../models/FileBasedAccount'

const loginWithToken: RequestHandler = async (req, res, next) => {
  try {
    const { uid } = req.auth || {}

    // Get account from DB, password is not verified because we're already token-authorized at this point
    const account = Account.findById(uid)

    if (!account) {
      return next({
        statusCode: 400,
        message: 'Bad credentials',
      })
    }

    // Generate access token
    const token = jwt.signToken({ uid: account._id, role: account.role })

    // Remove password from response
    const { password: _, ...accountData } = account

    res.status(200).json({
      message: 'Succesfully got account',
      data: accountData,
      token,
    })
  } catch (error) {
    next(error)
  }
}

export default loginWithToken
