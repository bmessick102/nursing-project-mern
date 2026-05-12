import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'abdomen',
    label: 'Abdomen',
    kind: 'select',
    options: ['Soft, non-tender', 'Soft, tender', 'Firm', 'Rigid', 'Distended'],
    defaultValue: 'Soft, non-tender',
  },
  {
    key: 'bowelSounds',
    label: 'Bowel Sounds',
    kind: 'select',
    options: [
      'Normoactive all 4 quadrants',
      'Hyperactive',
      'Hypoactive',
      'Absent (5 min auscultation)',
    ],
    defaultValue: 'Normoactive all 4 quadrants',
  },
  {
    key: 'lastBM',
    label: 'Last Bowel Movement',
    kind: 'select',
    options: ['Today', '1-2 days ago', '3+ days ago', 'Unknown'],
    defaultValue: 'Today',
  },
  {
    key: 'stoolQuality',
    label: 'Stool Quality',
    kind: 'select',
    options: ['Normal/formed', 'Loose', 'Diarrhea', 'Constipated', 'Hard', 'Melena', 'Hematochezia'],
    defaultValue: 'Normal/formed',
  },
  {
    key: 'appetite',
    label: 'Appetite',
    kind: 'select',
    options: ['Good', 'Fair', 'Poor', 'NPO'],
    defaultValue: 'Good',
  },
  {
    key: 'nauseaVomiting',
    label: 'Nausea / Vomiting',
    kind: 'select',
    options: ['Denies', 'Nausea only', 'Emesis x1', 'Emesis x2+'],
    defaultValue: 'Denies',
  },
]

const GIAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="gi"
    title="Gastrointestinal"
    fields={fields}
    onSaved={onSaved}
  />
)

export default GIAssessment
