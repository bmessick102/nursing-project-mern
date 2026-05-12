import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'urineColor',
    label: 'Urine Color',
    kind: 'select',
    options: ['Clear yellow', 'Dark yellow', 'Amber', 'Tea-colored', 'Hematuria', 'Cloudy'],
    defaultValue: 'Clear yellow',
  },
  {
    key: 'voidingPattern',
    label: 'Voiding Pattern',
    kind: 'select',
    options: ['Voiding without difficulty', 'Frequency', 'Urgency', 'Dysuria', 'Incontinence', 'Anuria/Oliguria'],
    defaultValue: 'Voiding without difficulty',
  },
  {
    key: 'continence',
    label: 'Continence',
    kind: 'select',
    options: ['Continent', 'Stress incontinence', 'Urge incontinence', 'Total incontinence'],
    defaultValue: 'Continent',
  },
  {
    key: 'catheter',
    label: 'Catheter',
    kind: 'select',
    options: ['None', 'Foley catheter', 'Straight cath PRN', 'Suprapubic', 'External (condom)'],
    defaultValue: 'None',
  },
  {
    key: 'bladderDistention',
    label: 'Bladder Distention',
    kind: 'select',
    options: ['None palpable', 'Mildly distended', 'Markedly distended'],
    defaultValue: 'None palpable',
  },
]

const GUAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="gu"
    title="Genitourinary"
    fields={fields}
    onSaved={onSaved}
  />
)

export default GUAssessment
