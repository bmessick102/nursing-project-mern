import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'rom',
    label: 'Range of Motion',
    kind: 'select',
    options: ['Full ROM all extremities', 'Limited (specify)', 'Bed-bound', 'Contractures present'],
    defaultValue: 'Full ROM all extremities',
  },
  {
    key: 'gait',
    label: 'Gait',
    kind: 'select',
    options: ['Steady', 'Unsteady', 'Shuffling', 'Requires assistance', 'Non-ambulatory'],
    defaultValue: 'Steady',
  },
  {
    key: 'assistiveDevice',
    label: 'Assistive Device',
    kind: 'select',
    options: ['None', 'Cane', 'Walker', 'Wheelchair', 'Crutches'],
    defaultValue: 'None',
  },
  {
    key: 'jointPain',
    label: 'Joint Pain / Swelling',
    kind: 'select',
    options: ['Denies', 'Mild', 'Moderate', 'Severe'],
    defaultValue: 'Denies',
  },
  {
    key: 'fallRisk',
    label: 'Fall Risk Status',
    kind: 'select',
    options: ['Low (Morse <25)', 'Moderate (Morse 25-50)', 'High (Morse >50)'],
    defaultValue: 'Low (Morse <25)',
  },
]

const MusculoskeletalAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="musculoskeletal"
    title="Musculoskeletal"
    fields={fields}
    onSaved={onSaved}
  />
)

export default MusculoskeletalAssessment
