import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'breathSounds',
    label: 'Breath Sounds',
    kind: 'select',
    options: [
      'Clear all lobes',
      'Diminished bases',
      'Crackles',
      'Wheezes',
      'Rhonchi',
      'Stridor',
      'Absent',
    ],
    defaultValue: 'Clear all lobes',
  },
  {
    key: 'effort',
    label: 'Respiratory Effort',
    kind: 'select',
    options: ['Unlabored', 'Mild dyspnea', 'Moderate dyspnea', 'Severe distress', 'Accessory muscle use'],
    defaultValue: 'Unlabored',
  },
  {
    key: 'cough',
    label: 'Cough',
    kind: 'select',
    options: ['None', 'Dry', 'Productive', 'Hemoptysis'],
    defaultValue: 'None',
  },
  {
    key: 'sputumColor',
    label: 'Sputum (if productive)',
    kind: 'select',
    options: ['N/A', 'Clear', 'White', 'Yellow', 'Green', 'Blood-tinged'],
    defaultValue: 'N/A',
  },
  {
    key: 'oxygenSupport',
    label: 'Oxygen Support',
    kind: 'select',
    options: [
      'Room air',
      'Nasal cannula 1-4 L/min',
      'Nasal cannula 5-6 L/min',
      'Simple mask',
      'Non-rebreather',
      'BiPAP',
      'Ventilator',
    ],
    defaultValue: 'Room air',
  },
  {
    key: 'chestExpansion',
    label: 'Chest Expansion',
    kind: 'select',
    options: ['Symmetrical', 'Asymmetrical', 'Decreased bilaterally'],
    defaultValue: 'Symmetrical',
  },
]

const RespiratoryAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="respiratory"
    title="Respiratory"
    fields={fields}
    onSaved={onSaved}
  />
)

export default RespiratoryAssessment
