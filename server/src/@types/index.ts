export type AccountRole =
  | 'student'
  | 'instructor'
  | 'administrator'
  | 'user'
  | 'admin'

export interface Account {
  username: string
  password: string
  role: AccountRole
  firstName?: string
  lastName?: string
  email?: string
}

export interface InviteCodeUse {
  accountId: string
  username: string
  usedAt: string
}

export interface InviteCode {
  _id: string
  code: string
  role: AccountRole
  maxUses: number | null // null = unlimited
  useCount: number
  expiresAt?: string
  createdBy: string
  createdAt: string
  note?: string
  active: boolean
  usedBy: InviteCodeUse[]
}
