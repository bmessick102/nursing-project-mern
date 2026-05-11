export interface Account {
  _id: string
  username: string
  password?: string
  role: 'user' | 'admin'
}

export interface FormData {
  username: string
  password: string
}

export interface Course {
  _id: string
  name: string
  code: string
  instructor: string
  description: string
}

export interface VitalSigns {
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

export interface LabResult {
  _id: string
  category: string
  name: string
  value: string
  unit: string
  referenceRange: string
  date: string
  flag?: 'H' | 'L' | 'C'
}

export interface Encounter {
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

export interface NursingNote {
  _id: string
  date: string
  time: string
  type: string
  author: string
  authorRole: string
  content: string
  signed: boolean
}

export interface MAREntry {
  _id: string
  medicationName: string
  dose: string
  route: string
  frequency: string
  scheduledTimes: string[]
  administrations: Array<{
    scheduledTime: string
    status: 'given' | 'due' | 'overdue' | 'held'
    givenAt?: string
    givenBy?: string
  }>
}

export interface IOEntry {
  _id: string
  timestamp: string
  type: 'intake' | 'output'
  category: string
  amount: number
  unit: string
  documentedBy: string
}

export interface Order {
  _id: string
  type: 'medication' | 'diet' | 'lab' | 'nursing' | 'therapy'
  name: string
  details: string
  status: 'active' | 'completed' | 'discontinued'
  orderedBy: string
  date: string
  priority?: 'routine' | 'stat' | 'urgent'
}

export interface Patient {
  _id: string
  courseId: string
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
  dischargeSummary?: {
    anticipatedDate: string
    condition: string
    instructions: string[]
  }
}
