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
  enrolledCourseIds?: string[]
  active?: boolean
}

export interface Course {
  _id: string
  name: string
  code: string
  instructor: string
  description: string
  inviteCode: string
  enrolledAccountIds: string[]
  createdAt: string
  updatedAt: string
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
