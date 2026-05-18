import { type RequestHandler } from 'express'
import Account from '../../models/FileBasedAccount'

const listAccounts: RequestHandler = (_req, res, next) => {
  try {
    const accounts = Account.findAll().map((a) => {
      // strip password before returning
      const { password: _omit, ...safe } = a as any
      return safe
    })
    res.status(200).json({ message: 'Accounts retrieved', data: accounts })
  } catch (error) {
    next(error)
  }
}

export default listAccounts
