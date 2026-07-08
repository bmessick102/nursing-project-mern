// Produces human-readable, timestamped text snippets of a patient's LATEST clinical
// data, for insertion into a nursing note. Formatters are pure and position-agnostic —
// they add no leading/trailing newlines (the editor handles placement) — and each one
// defensively handles missing/empty data and sorts by timestamp DESCENDING rather than
// trusting array order.

import type {
  AssessmentSystem,
  MAREntry,
  NursingAssessment,
  Patient,
  VitalSigns,
} from '@types'
import type { VitalMetric } from 'utils/vitalRanges'
import { getVitalSeverity, severityPrefix } from 'utils/vitalRanges'
import { computeLabFlag, findLabEntry, isNumericLab } from 'data/labReference'

export interface InsertSection {
  key: string
  label: string
  hasData: (p: Patient) => boolean
  build: (p: Patient) => string
}

// Copied (not imported) from components/tabs/AssessmentsTab.tsx to avoid a
// util -> component dependency.
const SYSTEM_LABEL: Record<AssessmentSystem, string> = {
  neuro: 'Neurological',
  cardiac: 'Cardiovascular',
  respiratory: 'Respiratory',
  gi: 'Gastrointestinal',
  gu: 'Genitourinary',
  skin: 'Skin / Integumentary',
  pain: 'Pain (PQRST)',
  musculoskeletal: 'Musculoskeletal',
  psychosocial: 'Psychosocial',
}

// --- shared helpers ---------------------------------------------------------

const fmtTs = (iso?: string): string => {
  if (!iso) return 'unknown time'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? 'unknown time' : d.toLocaleString()
}

const tsValue = (iso?: string): number => {
  if (!iso) return 0
  const t = new Date(iso).getTime()
  return Number.isNaN(t) ? 0 : t
}

const header = (label: string, whenIso?: string): string =>
  `--- ${label} (charted ${fmtTs(whenIso)}) ---`

// Applies the non-color severity prefix ('⚠ ' / '↑ ' / '') for a vital metric.
const withVitalSev = (metric: VitalMetric, value: number, text: string): string =>
  `${severityPrefix(getVitalSeverity(metric, value))}${text}`

// Derive an H / L / C flag from a lab value when none is stored.
const deriveLabFlag = (name: string, value: string): '' | 'H' | 'L' | 'C' => {
  const entry = findLabEntry(name)
  if (!entry || !isNumericLab(entry)) return ''
  const num = parseFloat(value)
  if (Number.isNaN(num)) return ''
  return computeLabFlag(entry, num)
}

// Join an assessment's findings the same way AssessmentsTab renders them.
const joinFindings = (findings: NursingAssessment['findings']): string =>
  Object.entries(findings || {})
    .filter(([, v]) => v !== '' && v !== false && v != null)
    .map(([k, v]) => `${k}: ${v}`)
    .join(' · ')

// --- section builders -------------------------------------------------------

const buildVitals = (p: Patient): string => {
  const vitals = [...(p.vitals || [])].sort(
    (a, b) => tsValue(b.timestamp) - tsValue(a.timestamp),
  )
  const v: VitalSigns | undefined = vitals[0]
  if (!v) return ''
  const parts: string[] = [
    withVitalSev('temp', v.temp, `T ${v.temp}°F (${v.tempSource})`),
    `BP ${withVitalSev('systolic', v.systolic, String(v.systolic))}/${withVitalSev(
      'diastolic',
      v.diastolic,
      String(v.diastolic),
    )}`,
    withVitalSev('heartRate', v.heartRate, `HR ${v.heartRate}`),
    withVitalSev('respiratoryRate', v.respiratoryRate, `RR ${v.respiratoryRate}`),
    withVitalSev('spo2', v.spo2, `SpO2 ${v.spo2}%`),
    withVitalSev('painScore', v.painScore, `Pain ${v.painScore}/10`),
  ]
  return `${header('Vitals', v.timestamp)}\n${parts.join(' · ')}`
}

const marLine = (m: MAREntry): string => {
  let line = `${m.medicationName} ${m.dose} ${m.route} ${m.frequency}`.trim()
  const admins = [...(m.administrations || [])].sort(
    (a, b) => tsValue(b.givenAt || b.scheduledTime) - tsValue(a.givenAt || a.scheduledTime),
  )
  const latest = admins[0]
  if (latest) {
    if (latest.status === 'given') {
      line += ` — last given ${fmtTs(latest.givenAt)}${
        latest.givenBy ? ` by ${latest.givenBy}` : ''
      }`
    } else {
      line += ` — ${latest.status} ${fmtTs(latest.scheduledTime)}`
    }
  }
  return line
}

const buildMedications = (p: Patient): string => {
  const marEntries = p.marEntries || []
  if (marEntries.length > 0) {
    return `--- Medications ---\n${marEntries.map(marLine).join('\n')}`
  }
  const meds = p.medications || []
  const lines = meds.map((m) => `${m.name} ${m.dose} ${m.frequency}`.trim())
  return `--- Medications ---\n${lines.join('\n')}`
}

const buildLabs = (p: Patient): string => {
  const labs = [...(p.labs || [])].sort(
    (a, b) => tsValue(b.date) - tsValue(a.date),
  )
  const seen = new Set<string>()
  const latest = labs.filter((l) => {
    if (seen.has(l.name)) return false
    seen.add(l.name)
    return true
  })
  const latestDate = latest[0]?.date
  const lines = latest.map((l) => {
    const flag = l.flag || deriveLabFlag(l.name, l.value)
    const flagText = flag ? ` [${flag}]` : ''
    const range = l.referenceRange ? ` (${l.referenceRange})` : ''
    return `${l.name} ${l.value}${l.unit ? ` ${l.unit}` : ''}${range}${flagText}`
  })
  return `${header('Labs', latestDate)}\n${lines.join(' · ')}`
}

const buildIO = (p: Patient): string => {
  const entries = p.ioEntries || []
  const totalIntake = entries
    .filter((e) => e.type === 'intake')
    .reduce((sum, e) => sum + (e.amount || 0), 0)
  const totalOutput = entries
    .filter((e) => e.type === 'output')
    .reduce((sum, e) => sum + (e.amount || 0), 0)
  const balance = totalIntake - totalOutput
  const sign = balance >= 0 ? '+' : '-'
  const latest = [...entries].sort(
    (a, b) => tsValue(b.timestamp) - tsValue(a.timestamp),
  )[0]
  return `${header('I/O', latest?.timestamp)}\nIntake: ${totalIntake} mL · Output: ${totalOutput} mL · Net balance: ${sign}${Math.abs(
    balance,
  )} mL`
}

const buildAssessment = (p: Patient): string => {
  const assessments = p.assessments || []
  const latestBySystem: Record<string, NursingAssessment> = {}
  for (const a of assessments) {
    const existing = latestBySystem[a.system]
    if (!existing || tsValue(a.timestamp) > tsValue(existing.timestamp)) {
      latestBySystem[a.system] = a
    }
  }
  const rows = Object.keys(latestBySystem)
    .map((k) => latestBySystem[k])
    .sort((a, b) => tsValue(b.timestamp) - tsValue(a.timestamp))
  const newest = rows[0]?.timestamp
  const lines = rows.map((a) => {
    const label: string = SYSTEM_LABEL[a.system] || a.system
    const findings = joinFindings(a.findings)
    const narrative = (a.narrative || '').trim()
    if (a.wdl && !narrative && !findings) return `${label}: WDL`
    const detail = [findings, narrative].filter((s) => s !== '').join(' — ')
    return `${label}: ${detail || 'WDL'}`
  })
  return `${header('Assessment', newest)}\n${lines.join('\n')}`
}

const buildAllergies = (p: Patient): string => {
  const allergies = p.allergies || []
  const diagnosis = p.diagnosis || []
  const lines: string[] = [
    `Allergies: ${allergies.length > 0 ? allergies.join(', ') : 'NKDA'}`,
  ]
  if (diagnosis.length > 0) {
    lines.push(`Active diagnoses: ${diagnosis.join(', ')}`)
  }
  return `--- Allergies/Diagnoses ---\n${lines.join('\n')}`
}

// --- public contract --------------------------------------------------------

export const INSERT_SECTIONS: InsertSection[] = [
  {
    key: 'vitals',
    label: 'Vitals',
    hasData: (p) => (p.vitals || []).length > 0,
    build: buildVitals,
  },
  {
    key: 'medications',
    label: 'Medications',
    hasData: (p) => (p.marEntries || []).length > 0 || (p.medications || []).length > 0,
    build: buildMedications,
  },
  {
    key: 'labs',
    label: 'Labs',
    hasData: (p) => (p.labs || []).length > 0,
    build: buildLabs,
  },
  {
    key: 'io',
    label: 'I/O',
    hasData: (p) => (p.ioEntries || []).length > 0,
    build: buildIO,
  },
  {
    key: 'assessment',
    label: 'Assessment',
    hasData: (p) => (p.assessments || []).length > 0,
    build: buildAssessment,
  },
  {
    key: 'allergies',
    label: 'Allergies/Diagnoses',
    hasData: (p) => (p.allergies || []).length > 0 || (p.diagnosis || []).length > 0,
    build: buildAllergies,
  },
]
