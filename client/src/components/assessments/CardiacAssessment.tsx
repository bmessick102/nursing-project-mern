import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'rhythm',
    label: 'Heart Rhythm',
    kind: 'select',
    options: ['Regular', 'Irregular', 'A-Fib', 'A-Flutter', 'V-Tach', 'Other'],
    defaultValue: 'Regular',
  },
  {
    key: 's1s2',
    label: 'Heart Sounds',
    kind: 'select',
    options: ['Normal S1/S2', 'S3 gallop', 'S4 gallop', 'Murmur present', 'Friction rub'],
    defaultValue: 'Normal S1/S2',
  },
  {
    key: 'edema',
    label: 'Edema',
    kind: 'select',
    options: ['None', '1+ trace', '2+ mild', '3+ moderate', '4+ severe'],
    defaultValue: 'None',
  },
  {
    key: 'edemaLocation',
    label: 'Edema Location',
    kind: 'checkbox-group',
    options: ['Bilateral LE', 'Unilateral LE', 'Sacral', 'Periorbital', 'Generalized'],
  },
  {
    key: 'capRefill',
    label: 'Capillary Refill',
    kind: 'select',
    options: ['<3 seconds', '>3 seconds', 'Sluggish'],
    defaultValue: '<3 seconds',
  },
  {
    key: 'pulses',
    label: 'Peripheral Pulses',
    kind: 'select',
    options: ['2+ all peripheral', '1+ weak/thready', 'Absent (Doppler needed)'],
    defaultValue: '2+ all peripheral',
  },
  {
    key: 'chestPain',
    label: 'Chest Pain',
    kind: 'select',
    options: ['Denies', 'Mild', 'Moderate', 'Severe'],
    defaultValue: 'Denies',
  },
]

const CardiacAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="cardiac"
    title="Cardiovascular"
    fields={fields}
    onSaved={onSaved}
  />
)

export default CardiacAssessment
