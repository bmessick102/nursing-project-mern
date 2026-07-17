export type AccountRole =
  | 'student'
  | 'instructor'
  | 'administrator'
  | 'user'
  | 'admin'

export interface Account {
  _id: string
  username: string
  password?: string
  firstName?: string
  lastName?: string
  email?: string
  role: AccountRole
  enrolledCourseIds?: string[]
  active?: boolean
}

export interface FormData {
  username: string
  password: string
}

export interface RegisterData {
  username: string
  password: string
  firstName: string
  lastName: string
  email: string
}

export interface Modification {
  modifiedAt: string
  modifiedBy: string
  reason?: string
  previousSnapshot: Record<string, unknown>
}

export interface Addendum {
  _id: string
  timestamp: string
  author: string
  authorRole?: string
  content: string
}

export interface Auditable {
  lastModifiedAt?: string
  lastModifiedBy?: string
  modifications?: Modification[]
  markedInError?: boolean
  markedInErrorReason?: string
  markedInErrorBy?: string
  markedInErrorAt?: string
  addenda?: Addendum[]
}

export interface Course {
  _id: string
  name: string
  code: string
  instructor: string
  description: string
  inviteCode?: string
  enrolledAccountIds?: string[]
  // Account id of the faculty/admin who created the course; absent on legacy courses.
  ownerAccountId?: string
  // Soft-archive flag: when true the course is hidden from students but stays manageable/un-archivable.
  archived?: boolean
  // Resolved display name/username of the owning account; admin-only, derived server-side.
  publisherName?: string
  publisherUsername?: string
}

export interface NoteTemplate {
  _id: string
  name: string
  courseId: string | null // null = global (all courses)
  format: 'freetext' | 'soap'
  content?: string
  soap?: { subjective?: string; objective?: string; assessment?: string; plan?: string }
  defaultRole?: string // e.g. 'RN', 'Physician (MD)'
  defaultType?: string // e.g. 'Progress Note'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface VitalSigns extends Auditable {
  _id: string
  timestamp: string
  temp: number
  tempSource: string
  systolic: number
  diastolic: number
  heartRate: number
  respiratoryRate: number
  spo2: number
  painScore: number
  position: string
  documentedBy: string
}

export interface LabResult extends Auditable {
  _id: string
  category: string
  name: string
  value: string
  unit: string
  referenceRange: string
  date: string
  flag?: 'H' | 'L' | 'C'
}

export interface Encounter extends Auditable {
  _id: string
  date: string
  type: string
  provider: string
  specialty: string
  diagnosis: string
  subjective?: string
  objective?: string
  assessment?: string
  plan?: string
}

export interface InstructorComment {
  _id: string
  timestamp: string
  author: string
  authorRole: string
  content: string
}

export interface PeerAssessment {
  _id: string
  peerReviewId: string
  correct: boolean
  comment: string
  createdAt: string
}

export interface PeerReview {
  _id: string
  courseId: string
  templateId: string
  reviewerAccountId: string
  revieweeInstanceId: string
  revieweeAccountId: string
  status: 'assigned' | 'submitted'
  createdBy: string
  createdAt: string
  updatedAt: string
}

export interface NursingNote extends Auditable {
  _id: string
  date: string
  time: string
  type: string
  author: string
  authorRole: string
  content: string
  signed: boolean
  format?: 'freetext' | 'soap'
  soap?: {
    subjective?: string
    objective?: string
    assessment?: string
    plan?: string
  }
  instructorComments?: InstructorComment[]
  peerAssessments?: PeerAssessment[]
}

export interface MARAdministration extends Auditable {
  _id?: string
  scheduledTime: string
  status: 'given' | 'due' | 'overdue' | 'held'
  givenAt?: string
  givenBy?: string
}

export interface MAREntry extends Auditable {
  _id: string
  medicationName: string
  dose: string
  route: string
  frequency: string
  scheduledTimes: string[]
  administrations: MARAdministration[]
}

export interface IOEntry extends Auditable {
  _id: string
  timestamp: string
  type: 'intake' | 'output'
  category: string
  amount: number
  unit: string
  documentedBy: string
}

export interface Order extends Auditable {
  _id: string
  type: 'medication' | 'diet' | 'lab' | 'nursing' | 'therapy'
  name: string
  details: string
  status: 'active' | 'completed' | 'discontinued'
  orderedBy: string
  date: string
  priority?: 'routine' | 'stat' | 'urgent'
}

export type AssessmentSystem =
  | 'neuro'
  | 'cardiac'
  | 'respiratory'
  | 'gi'
  | 'gu'
  | 'skin'
  | 'pain'
  | 'musculoskeletal'
  | 'psychosocial'

export interface NursingAssessment extends Auditable {
  _id: string
  timestamp: string
  system: AssessmentSystem
  wdl: boolean
  findings: Record<string, string | boolean | number>
  narrative?: string
  documentedBy: string
  signed: boolean
}

export interface BradenScore extends Auditable {
  _id: string
  timestamp: string
  sensoryPerception: number
  moisture: number
  activity: number
  mobility: number
  nutrition: number
  frictionShear: number
  total: number
  riskLevel: 'no risk' | 'mild' | 'moderate' | 'high' | 'severe'
  documentedBy: string
}

export interface Patient {
  _id: string
  courseId: string
  isCaseStudy?: boolean
  availableFrom?: string
  availableUntil?: string
  ownerAccountId?: string
  templateId?: string
  relativeDateOffsetDays?: number // on a case-study TEMPLATE: the most-recent clinical entry is placed this many days before the student's open time (default 2 when absent)
  dateShiftMs?: number // internal: on an INSTANCE, the ms shift applied to the copied timeline at clone time (so instructor notes can be shifted consistently later)
  instructorNotes?: NursingNote[] // derived/read-only: a live copy of the case-study template's nursingNotes, injected by the API for a student's instance. Not persisted.
  name: string
  age: number
  gender: string
  roomNumber: string
  diagnosis: string[]
  allergies: string[]
  medications: Array<{
    name: string
    dose: string
    frequency: string
  }>
  vitals: VitalSigns[]
  labs: LabResult[]
  encounters: Encounter[]
  nursingNotes: NursingNote[]
  marEntries: MAREntry[]
  ioEntries: IOEntry[]
  orders: Order[]
  assessments: NursingAssessment[]
  bradenScores: BradenScore[]
  dischargeSummary?: {
    anticipatedDate: string
    condition: string
    instructions: string[]
  }
  grade?: {
    score: number
    maxScore: number
    feedback?: string
    gradedBy: string
    gradedAt: string
  }
}
