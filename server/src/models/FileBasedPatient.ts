import fileDb from '../utils/fileDb'

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
  createdAt: string
  updatedAt: string
}

const COLLECTION = 'patients'

const normalizePatient = (patient: any): Patient => {
  return {
    ...patient,
    vitals: patient.vitals || [],
    labs: patient.labs || [],
    encounters: patient.encounters || [],
    nursingNotes: patient.nursingNotes || [],
    marEntries: patient.marEntries || [],
    ioEntries: patient.ioEntries || [],
    orders: patient.orders || [],
  }
}

const findAll = (): Patient[] => {
  const patients = fileDb.readCollection(COLLECTION) as Patient[]
  return patients.map(normalizePatient)
}

const findById = (id: string): Patient | undefined => {
  const patients = fileDb.readCollection(COLLECTION) as Patient[]
  const patient = patients.find((p: Patient) => p._id === id)
  return patient ? normalizePatient(patient) : undefined
}

const findByCourse = (courseId: string): Patient[] => {
  const patients = fileDb.readCollection(COLLECTION) as Patient[]
  return patients.filter((p: Patient) => p.courseId === courseId).map(normalizePatient)
}

const create = (data: Omit<Patient, '_id' | 'createdAt' | 'updatedAt'>) => {
  const patients = fileDb.readCollection(COLLECTION)
  const newPatient: Patient = {
    vitals: [],
    labs: [],
    encounters: [],
    nursingNotes: [],
    marEntries: [],
    ioEntries: [],
    orders: [],
    ...data,
    _id: fileDb.generateId(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
  patients.push(newPatient)
  fileDb.writeCollection(COLLECTION, patients)
  return newPatient
}

const update = (id: string, data: Partial<Patient>): Patient | undefined => {
  const patients = fileDb.readCollection(COLLECTION) as Patient[]
  const idx = patients.findIndex((p) => p._id === id)
  if (idx === -1) return undefined
  const updated = {
    ...patients[idx],
    ...data,
    updatedAt: new Date().toISOString(),
  }
  patients[idx] = updated
  fileDb.writeCollection(COLLECTION, patients)
  return normalizePatient(patients[idx])
}

const initializeDefaultPatients = () => {
  const patients = fileDb.readCollection(COLLECTION)
  if (patients.length === 0) {
    console.log('Initializing default patients...')
    const now = new Date()
    const baseDate = new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000) // 2 days ago

    const defaultPatients = [
      {
        courseId: '',
        name: 'John Smith',
        age: 65,
        gender: 'Male',
        roomNumber: '301',
        diagnosis: ['Type 2 Diabetes', 'Hypertension', 'Essential Hypertension'],
        allergies: ['Penicillin'],
        medications: [
          { name: 'Metformin', dose: '500mg', frequency: 'Twice daily' },
          { name: 'Lisinopril', dose: '10mg', frequency: 'Once daily' },
          { name: 'Atorvastatin', dose: '20mg', frequency: 'Once daily' },
        ],
        vitals: [
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime()).toISOString(),
            temp: 98.6,
            tempSource: 'Oral',
            systolic: 138,
            diastolic: 88,
            heartRate: 72,
            respiratoryRate: 16,
            spo2: 97,
            painScore: 2,
            position: 'Sitting',
            documentedBy: 'RN Sarah',
          },
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 6 * 60 * 60 * 1000).toISOString(),
            temp: 98.8,
            tempSource: 'Oral',
            systolic: 140,
            diastolic: 90,
            heartRate: 75,
            respiratoryRate: 16,
            spo2: 98,
            painScore: 1,
            position: 'Sitting',
            documentedBy: 'RN James',
          },
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            temp: 99.1,
            tempSource: 'Oral',
            systolic: 135,
            diastolic: 85,
            heartRate: 70,
            respiratoryRate: 16,
            spo2: 97,
            painScore: 0,
            position: 'Lying',
            documentedBy: 'RN Sarah',
          },
        ],
        labs: [
          {
            _id: fileDb.generateId(),
            category: 'CHEMISTRY',
            name: 'Hemoglobin A1C',
            value: '7.2',
            unit: '%',
            referenceRange: '<5.7',
            date: new Date(baseDate.getTime()).toISOString(),
            flag: 'H',
          },
          {
            _id: fileDb.generateId(),
            category: 'CHEMISTRY',
            name: 'Glucose, Fasting',
            value: '145',
            unit: 'mg/dL',
            referenceRange: '70-100',
            date: new Date(baseDate.getTime()).toISOString(),
            flag: 'H',
          },
          {
            _id: fileDb.generateId(),
            category: 'CHEMISTRY',
            name: 'Sodium',
            value: '138',
            unit: 'mEq/L',
            referenceRange: '136-145',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'CHEMISTRY',
            name: 'Potassium',
            value: '4.2',
            unit: 'mEq/L',
            referenceRange: '3.5-5.0',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'CHEMISTRY',
            name: 'Creatinine',
            value: '1.1',
            unit: 'mg/dL',
            referenceRange: '0.7-1.3',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'HEMATOLOGY',
            name: 'WBC',
            value: '7.2',
            unit: 'K/uL',
            referenceRange: '4.5-11.0',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'HEMATOLOGY',
            name: 'RBC',
            value: '4.8',
            unit: 'M/uL',
            referenceRange: '4.5-5.5',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'HEMATOLOGY',
            name: 'Hemoglobin',
            value: '14.5',
            unit: 'g/dL',
            referenceRange: '13.5-17.5',
            date: new Date(baseDate.getTime()).toISOString(),
          },
          {
            _id: fileDb.generateId(),
            category: 'HEMATOLOGY',
            name: 'Platelets',
            value: '245',
            unit: 'K/uL',
            referenceRange: '150-400',
            date: new Date(baseDate.getTime()).toISOString(),
          },
        ],
        encounters: [
          {
            _id: fileDb.generateId(),
            date: new Date(baseDate.getTime()).toISOString(),
            type: 'Admission',
            provider: 'Dr. Michael Davis',
            specialty: 'Internal Medicine',
            diagnosis: 'Hypertensive crisis with Type 2 Diabetes',
            subjective: 'Patient reports chest discomfort and shortness of breath. States that he has been under stress at work.',
            objective: 'BP 156/98, HR 88, RR 18, SpO2 96%. Lungs clear to auscultation. Heart regular rate and rhythm.',
            assessment: 'Hypertensive emergency. Type 2 Diabetes Mellitus with suboptimal control.',
            plan: 'Admit for monitoring. Start IV antihypertensive therapy. Adjust home medications. Consult cardiology.',
          },
          {
            _id: fileDb.generateId(),
            date: new Date(baseDate.getTime() + 24 * 60 * 60 * 1000).toISOString(),
            type: 'Office Visit',
            provider: 'Dr. Michelle Wong',
            specialty: 'Cardiology',
            diagnosis: 'Hypertension, well-controlled; Diabetes review',
            subjective: 'Patient feeling better. Denies chest pain or SOB. Compliant with medications.',
            objective: 'BP 138/86, HR 72. EKG normal. Chest X-ray clear.',
            assessment: 'Hypertension responding well to therapy. Diabetes stable.',
            plan: 'Continue current regimen. Follow-up labs in 6 weeks. Dietary consult for low-sodium diet.',
          },
        ],
        nursingNotes: [
          {
            _id: fileDb.generateId(),
            date: new Date(baseDate.getTime()).toISOString(),
            time: '14:30',
            type: 'Admission Note',
            author: 'Sarah Johnson, RN',
            authorRole: 'Registered Nurse',
            content: 'Patient admitted via ED with complaint of chest discomfort and elevated BP. Alert and oriented x3. Denies smoking. Lives with wife. Daughter is primary contact and POA. Teaching provided regarding hospital stay and monitors. IV placed without difficulty.',
            signed: true,
          },
          {
            _id: fileDb.generateId(),
            date: new Date(baseDate.getTime() + 12 * 60 * 60 * 1000).toISOString(),
            time: '06:00',
            type: 'Progress Note',
            author: 'James Miller, RN',
            authorRole: 'Registered Nurse',
            content: 'Patient slept well overnight. Denies pain. Taking all medications as scheduled. Vital signs stable overnight. BP trending down from admission. Patient ambulating in hallway with minimal assistance. Wife at bedside. Continue current plan of care.',
            signed: true,
          },
        ],
        marEntries: [
          {
            _id: fileDb.generateId(),
            medicationName: 'Metformin',
            dose: '500mg',
            route: 'Oral',
            frequency: 'Twice daily',
            scheduledTimes: ['0600', '1800'],
            administrations: [
              { scheduledTime: '0600', status: 'given', givenAt: '0615', givenBy: 'RN James' },
              { scheduledTime: '1800', status: 'given', givenAt: '1805', givenBy: 'RN Sarah' },
            ],
          },
          {
            _id: fileDb.generateId(),
            medicationName: 'Lisinopril',
            dose: '10mg',
            route: 'Oral',
            frequency: 'Once daily',
            scheduledTimes: ['0800'],
            administrations: [
              { scheduledTime: '0800', status: 'given', givenAt: '0805', givenBy: 'RN James' },
            ],
          },
          {
            _id: fileDb.generateId(),
            medicationName: 'Atorvastatin',
            dose: '20mg',
            route: 'Oral',
            frequency: 'Once daily at bedtime',
            scheduledTimes: ['2100'],
            administrations: [
              { scheduledTime: '2100', status: 'due', givenAt: undefined, givenBy: undefined },
            ],
          },
        ],
        ioEntries: [
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 1 * 60 * 60 * 1000).toISOString(),
            type: 'intake',
            category: 'Oral',
            amount: 240,
            unit: 'mL',
            documentedBy: 'RN Sarah',
          },
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 2 * 60 * 60 * 1000).toISOString(),
            type: 'output',
            category: 'Urine',
            amount: 320,
            unit: 'mL',
            documentedBy: 'RN Sarah',
          },
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 4 * 60 * 60 * 1000).toISOString(),
            type: 'intake',
            category: 'Oral',
            amount: 180,
            unit: 'mL',
            documentedBy: 'RN James',
          },
          {
            _id: fileDb.generateId(),
            timestamp: new Date(baseDate.getTime() + 5 * 60 * 60 * 1000).toISOString(),
            type: 'output',
            category: 'Urine',
            amount: 280,
            unit: 'mL',
            documentedBy: 'RN James',
          },
        ],
        orders: [
          {
            _id: fileDb.generateId(),
            type: 'medication',
            name: 'Metformin 500mg',
            details: 'Oral, twice daily with meals',
            status: 'active',
            orderedBy: 'Dr. Michael Davis',
            date: new Date(baseDate.getTime()).toISOString(),
            priority: 'routine',
          },
          {
            _id: fileDb.generateId(),
            type: 'medication',
            name: 'Lisinopril 10mg',
            details: 'Oral, once daily in the morning',
            status: 'active',
            orderedBy: 'Dr. Michael Davis',
            date: new Date(baseDate.getTime()).toISOString(),
            priority: 'routine',
          },
          {
            _id: fileDb.generateId(),
            type: 'lab',
            name: 'Basic Metabolic Panel',
            details: 'STAT - check glucose, electrolytes, kidney function',
            status: 'completed',
            orderedBy: 'Dr. Michael Davis',
            date: new Date(baseDate.getTime()).toISOString(),
            priority: 'stat',
          },
          {
            _id: fileDb.generateId(),
            type: 'nursing',
            name: 'Bed rest with bathroom privileges',
            details: 'Monitor for orthostatic hypotension',
            status: 'active',
            orderedBy: 'Dr. Michael Davis',
            date: new Date(baseDate.getTime()).toISOString(),
            priority: 'routine',
          },
          {
            _id: fileDb.generateId(),
            type: 'diet',
            name: 'Low sodium, ADA diet',
            details: 'NPO after midnight. 1800 calorie ADA diet, <2g sodium',
            status: 'active',
            orderedBy: 'Dietician Susan Lee',
            date: new Date(baseDate.getTime()).toISOString(),
            priority: 'routine',
          },
        ],
        dischargeSummary: {
          anticipatedDate: new Date(baseDate.getTime() + 3 * 24 * 60 * 60 * 1000).toISOString(),
          condition: 'Stable, hypertension controlled, glucose levels improved',
          instructions: [
            'Take all medications as prescribed',
            'Follow low-sodium diet',
            'Monitor blood pressure at home twice daily',
            'Check blood glucose before meals and at bedtime',
            'Call if BP > 160 systolic or < 100 systolic',
            'Follow-up with PCP in 1 week',
            'Cardiology follow-up in 2 weeks',
          ],
        },
      },
      {
        courseId: '',
        name: 'Sarah Johnson',
        age: 45,
        gender: 'Female',
        roomNumber: '302',
        diagnosis: ['Post-operative appendectomy'],
        allergies: ['NSAID'],
        medications: [
          { name: 'Cephalexin', dose: '500mg', frequency: 'Four times daily' },
          { name: 'Acetaminophen', dose: '650mg', frequency: 'Every 6 hours as needed' },
        ],
        vitals: [],
        labs: [],
        encounters: [],
        nursingNotes: [],
        marEntries: [],
        ioEntries: [],
        orders: [],
      },
      {
        courseId: '',
        name: 'Michael Chen',
        age: 8,
        gender: 'Male',
        roomNumber: '201',
        diagnosis: ['Acute bronchitis'],
        allergies: [],
        medications: [
          { name: 'Amoxicillin', dose: '250mg', frequency: 'Three times daily' },
          { name: 'Albuterol', dose: '2mg', frequency: 'Every 4-6 hours' },
        ],
        vitals: [],
        labs: [],
        encounters: [],
        nursingNotes: [],
        marEntries: [],
        ioEntries: [],
        orders: [],
      },
    ]
    defaultPatients.forEach((patient) => create(patient))
  }
}

export default {
  findAll,
  findById,
  findByCourse,
  create,
  update,
  initializeDefaultPatients,
}
