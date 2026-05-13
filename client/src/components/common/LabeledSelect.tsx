import React, { useId } from 'react'
import { FormControl, InputLabel, Select, type SelectProps } from '@mui/material'

interface LabeledSelectProps extends Omit<SelectProps, 'label' | 'labelId'> {
  label: string
  fullWidth?: boolean
}

/**
 * Drop-in replacement for a bare `<Select>` paired with a `<Typography variant="caption">` label.
 * Wraps in `<FormControl>` + `<InputLabel>` so screen readers and AT have a programmatic name
 * association (WCAG 1.3.1, 4.1.2). Generates a unique id so multiple instances don't collide.
 */
const LabeledSelect: React.FC<LabeledSelectProps> = ({
  label,
  fullWidth = true,
  size = 'small',
  children,
  ...rest
}) => {
  const reactId = useId()
  const labelId = `${reactId}-label`

  return (
    <FormControl fullWidth={fullWidth} size={size}>
      <InputLabel id={labelId}>{label}</InputLabel>
      <Select {...rest} labelId={labelId} label={label}>
        {children}
      </Select>
    </FormControl>
  )
}

export default LabeledSelect
