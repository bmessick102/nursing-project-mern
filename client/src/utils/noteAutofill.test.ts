import type { Patient } from '@types'
import { INSERT_SECTIONS } from './noteAutofill'

// Minimal patient with every clinical array empty; tests override just what they need.
const basePatient = (over: Partial<Patient> = {}): Patient =>
  ({
    _id: 'p1',
    courseId: 'c1',
    name: 'Test Patient',
    age: 50,
    gender: 'Female',
    roomNumber: '101',
    diagnosis: [],
    allergies: [],
    medications: [],
    vitals: [],
    labs: [],
    encounters: [],
    nursingNotes: [],
    marEntries: [],
    ioEntries: [],
    orders: [],
    assessments: [],
    bradenScores: [],
    ...over,
  }) as unknown as Patient

const section = (key: string) => INSERT_SECTIONS.find((s) => s.key === key)!

describe('noteAutofill INSERT_SECTIONS', () => {
  it('exposes the six expected sections', () => {
    expect(INSERT_SECTIONS.map((s) => s.key)).toEqual([
      'vitals',
      'medications',
      'labs',
      'io',
      'assessment',
      'allergies',
    ])
  })

  it('disables data-less sections but keeps allergies enabled (NKDA)', () => {
    const p = basePatient()
    expect(section('vitals').hasData(p)).toBe(false)
    expect(section('labs').hasData(p)).toBe(false)
    expect(section('allergies').hasData(p)).toBe(false)
    // Even with no allergies documented, the block is meaningful (NKDA).
    expect(section('allergies').build(p)).toContain('NKDA')
  })

  it('formats the latest vitals set with an abnormal flag', () => {
    const p = basePatient({
      vitals: [
        { _id: 'v1', timestamp: '2026-07-06T08:00:00Z', temp: 98.6, tempSource: 'Oral', systolic: 118, diastolic: 76, heartRate: 72, respiratoryRate: 16, spo2: 98, painScore: 0, position: 'Sitting', documentedBy: 'RN' },
        { _id: 'v2', timestamp: '2026-07-06T12:00:00Z', temp: 99.1, tempSource: 'Oral', systolic: 190, diastolic: 96, heartRate: 88, respiratoryRate: 18, spo2: 97, painScore: 2, position: 'Lying', documentedBy: 'RN' },
      ] as any,
    })
    const out = section('vitals').build(p)
    // Uses the newest entry (systolic 190), not the older one.
    expect(out).toContain('BP')
    expect(out).toContain('190')
    expect(out).not.toContain('118')
    // Severity prefix from vitalRanges is applied to the abnormal systolic.
    expect(out).toMatch(/⚠|↑/)
  })

  it('dedupes labs to the most recent value per test name', () => {
    const p = basePatient({
      labs: [
        { _id: 'l1', category: 'CHEM', name: 'Potassium', value: '4.0', unit: 'mEq/L', referenceRange: '3.5-5.0', date: '2026-07-05T08:00:00Z' },
        { _id: 'l2', category: 'CHEM', name: 'Potassium', value: '5.9', unit: 'mEq/L', referenceRange: '3.5-5.0', date: '2026-07-06T08:00:00Z', flag: 'H' },
      ] as any,
    })
    const out = section('labs').build(p)
    expect(out).toContain('Potassium 5.9')
    expect(out).toContain('[H]')
    expect(out).not.toContain('4.0')
  })

  it('computes I/O totals and signed net balance', () => {
    const p = basePatient({
      ioEntries: [
        { _id: 'i1', timestamp: '2026-07-06T08:00:00Z', type: 'intake', category: 'Oral', amount: 500, unit: 'mL' },
        { _id: 'i2', timestamp: '2026-07-06T10:00:00Z', type: 'output', category: 'Urine', amount: 300, unit: 'mL' },
      ] as any,
    })
    const out = section('io').build(p)
    expect(out).toContain('Intake: 500 mL')
    expect(out).toContain('Output: 300 mL')
    expect(out).toContain('+200 mL')
  })

  it('emits WDL for a within-limits assessment with no findings', () => {
    const p = basePatient({
      assessments: [
        { _id: 'a1', timestamp: '2026-07-06T08:00:00Z', system: 'neuro', wdl: true, findings: {}, documentedBy: 'RN', signed: true },
      ] as any,
    })
    const out = section('assessment').build(p)
    expect(out).toContain('Neurological: WDL')
  })
})
