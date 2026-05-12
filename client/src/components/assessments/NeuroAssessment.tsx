import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'loc',
    label: 'Level of Consciousness',
    kind: 'select',
    options: ['Alert', 'Lethargic', 'Stuporous', 'Obtunded', 'Comatose'],
    defaultValue: 'Alert',
  },
  {
    key: 'orientation',
    label: 'Orientation',
    kind: 'select',
    options: ['x4 (person/place/time/situation)', 'x3', 'x2', 'x1', 'Disoriented'],
    defaultValue: 'x4 (person/place/time/situation)',
  },
  {
    key: 'pupils',
    label: 'Pupils',
    kind: 'select',
    options: ['PERRLA', 'Sluggish bilaterally', 'Unequal', 'Fixed/dilated', 'Pinpoint'],
    defaultValue: 'PERRLA',
  },
  {
    key: 'speech',
    label: 'Speech',
    kind: 'select',
    options: ['Clear', 'Slurred', 'Aphasic', 'Non-verbal'],
    defaultValue: 'Clear',
  },
  {
    key: 'motorStrength',
    label: 'Motor Strength',
    kind: 'select',
    options: [
      '5/5 all extremities',
      '4/5 unilateral weakness',
      '3/5 generalized weakness',
      '0-2/5 (paresis)',
    ],
    defaultValue: '5/5 all extremities',
  },
  {
    key: 'sensation',
    label: 'Sensation',
    kind: 'select',
    options: ['Intact', 'Diminished', 'Absent', 'Paresthesia present'],
    defaultValue: 'Intact',
  },
]

const NeuroAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="neuro"
    title="Neurological"
    fields={fields}
    onSaved={onSaved}
  />
)

export default NeuroAssessment
