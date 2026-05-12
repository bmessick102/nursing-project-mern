import React from 'react'
import AssessmentForm, { AssessmentField } from './AssessmentForm'
import type { Patient } from '@types'

const fields: AssessmentField[] = [
  {
    key: 'mood',
    label: 'Mood / Affect',
    kind: 'select',
    options: ['Appropriate', 'Anxious', 'Depressed', 'Flat', 'Agitated', 'Tearful'],
    defaultValue: 'Appropriate',
  },
  {
    key: 'cooperation',
    label: 'Cooperation with Care',
    kind: 'select',
    options: ['Cooperative', 'Hesitant', 'Refuses care', 'Confused/non-cooperative'],
    defaultValue: 'Cooperative',
  },
  {
    key: 'supportSystem',
    label: 'Support System Present',
    kind: 'select',
    options: ['Family at bedside', 'Family available by phone', 'Limited support', 'No identified support'],
    defaultValue: 'Family at bedside',
  },
  {
    key: 'sleep',
    label: 'Sleep Quality',
    kind: 'select',
    options: ['Adequate', 'Restless', 'Insomnia', 'Excessive sleep'],
    defaultValue: 'Adequate',
  },
  {
    key: 'suicideRisk',
    label: 'Suicide / Self-Harm Risk',
    kind: 'select',
    options: ['Denies', 'Passive ideation', 'Active ideation w/o plan', 'Active ideation w/ plan'],
    defaultValue: 'Denies',
  },
  {
    key: 'copingMechanisms',
    label: 'Coping Mechanisms',
    kind: 'checkbox-group',
    options: ['Talking', 'Distraction', 'Prayer/spiritual', 'Withdrawal', 'Substance use'],
  },
]

const PsychosocialAssessment: React.FC<{ patient: Patient; onSaved?: (p: Patient) => void }> = ({
  patient,
  onSaved,
}) => (
  <AssessmentForm
    patient={patient}
    system="psychosocial"
    title="Psychosocial"
    fields={fields}
    onSaved={onSaved}
  />
)

export default PsychosocialAssessment
