export type Severity = 'normal' | 'borderline' | 'critical'

export type VitalMetric =
  | 'temp'
  | 'systolic'
  | 'diastolic'
  | 'heartRate'
  | 'respiratoryRate'
  | 'spo2'
  | 'painScore'

export const severityColor = (sev: Severity): { bg: string; fg: string } => {
  switch (sev) {
    case 'critical':
      return { bg: '#fdecea', fg: '#d32f2f' }
    case 'borderline':
      return { bg: '#fff3e0', fg: '#ed6c02' }
    default:
      return { bg: 'transparent', fg: 'inherit' }
  }
}

export const getVitalSeverity = (metric: VitalMetric, value: number): Severity => {
  if (Number.isNaN(value)) return 'normal'
  switch (metric) {
    case 'temp': // °F
      if (value < 95 || value >= 103) return 'critical'
      if (value < 96.8 || value >= 100.4) return 'borderline'
      return 'normal'
    case 'systolic':
      if (value < 80 || value >= 180) return 'critical'
      if (value < 90 || value >= 140) return 'borderline'
      return 'normal'
    case 'diastolic':
      if (value < 50 || value >= 120) return 'critical'
      if (value < 60 || value >= 90) return 'borderline'
      return 'normal'
    case 'heartRate':
      if (value < 40 || value >= 130) return 'critical'
      if (value < 60 || value >= 100) return 'borderline'
      return 'normal'
    case 'respiratoryRate':
      if (value < 8 || value >= 30) return 'critical'
      if (value < 12 || value >= 20) return 'borderline'
      return 'normal'
    case 'spo2':
      if (value < 88) return 'critical'
      if (value < 92) return 'borderline'
      return 'normal'
    case 'painScore':
      if (value >= 8) return 'critical'
      if (value >= 4) return 'borderline'
      return 'normal'
    default:
      return 'normal'
  }
}

export const vitalCellSx = (metric: VitalMetric, value: number) => {
  const sev = getVitalSeverity(metric, value)
  if (sev === 'normal') return {}
  const { bg, fg } = severityColor(sev)
  return {
    backgroundColor: bg,
    color: fg,
    fontWeight: 700,
  }
}

// Non-color signifier prefix for cells. WCAG 1.4.1 — do not rely on color alone.
export const severityPrefix = (sev: Severity): string =>
  sev === 'critical' ? '⚠ ' : sev === 'borderline' ? '↑ ' : ''

// Returns an aria-label describing the cell so screen-reader users hear
// "critical heart rate 142" rather than just "142".
export const vitalCellAriaLabel = (
  metric: VitalMetric,
  value: number,
  unit = '',
): string => {
  const sev = getVitalSeverity(metric, value)
  const name: Record<VitalMetric, string> = {
    temp: 'Temperature',
    systolic: 'Systolic BP',
    diastolic: 'Diastolic BP',
    heartRate: 'Heart rate',
    respiratoryRate: 'Respiratory rate',
    spo2: 'Oxygen saturation',
    painScore: 'Pain score',
  }
  if (sev === 'normal') return `${name[metric]} ${value}${unit}`
  return `${sev} ${name[metric]} ${value}${unit}`
}
