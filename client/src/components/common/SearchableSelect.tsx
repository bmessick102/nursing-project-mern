import React, { useId, useMemo } from 'react'
import { Autocomplete, TextField, type TextFieldProps } from '@mui/material'
import { createFilterOptions } from '@mui/material/Autocomplete'

export interface SelectOption {
  value: string
  label: string
  /** Optional secondary text shown under the label in the dropdown. */
  detail?: string
}

type RawOption = string | SelectOption

export interface SearchableSelectProps {
  /** Programmatic label (renders as the floating input label). */
  label: string
  /** Current selected value. */
  value: string
  /** Fires with the chosen option's value ('' when cleared). */
  onChange: (value: string) => void
  /** Options as plain strings or `{ value, label, detail }` objects. */
  options: RawOption[]
  fullWidth?: boolean
  size?: 'small' | 'medium'
  disabled?: boolean
  required?: boolean
  /** Placeholder shown when nothing is typed/selected. */
  placeholder?: string
  /** Allow arbitrary typed values not in the option list. */
  freeSolo?: boolean
  /** Helper text under the field. */
  helperText?: React.ReactNode
  error?: boolean
  sx?: TextFieldProps['sx']
  /** Extra props forwarded to the underlying TextField (e.g. name, inputProps). */
  textFieldProps?: Partial<TextFieldProps>
}

const toOption = (o: RawOption): SelectOption =>
  typeof o === 'string' ? { value: o, label: o } : o

const filter = createFilterOptions<SelectOption>({
  stringify: (o) => `${o.label} ${o.detail ?? ''}`,
})

const renderOption = (
  props: React.HTMLAttributes<HTMLLIElement> & { key?: React.Key },
  option: SelectOption,
) => {
  // Use MUI's own list key (unique per rendered option). Using option.value here
  // collapses duplicate-value options in React's reconciliation, which desyncs MUI's
  // data-option-index tracking and makes the hover highlight skip every other row.
  const { key, ...liProps } = props
  return (
    <li key={key} {...liProps}>
      <span style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{option.label}</span>
        {option.detail && (
          <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{option.detail}</span>
        )}
      </span>
    </li>
  )
}

/**
 * A type-to-search dropdown that is a drop-in replacement for the common
 * `<FormControl><InputLabel/><Select><MenuItem/></Select></FormControl>` pattern.
 *
 * - Users filter options by typing (matches label and detail text).
 * - `freeSolo` additionally lets users commit a value that isn't in the list.
 * - Keeps the same value/onChange(string) contract so call sites barely change.
 *
 * The `freeSolo` and closed-list modes use deliberately different wiring:
 *   • Closed list  → the *selected option object* is the controlled `value`.
 *   • freeSolo      → the typed *string* is the controlled `inputValue` (the value IS the text),
 *                     which avoids MUI's controlled/uncontrolled warnings for arbitrary input.
 */
const SearchableSelect: React.FC<SearchableSelectProps> = ({
  label,
  value,
  onChange,
  options,
  fullWidth = true,
  size = 'small',
  disabled,
  required,
  placeholder,
  freeSolo = false,
  helperText,
  error,
  sx,
  textFieldProps,
}) => {
  const reactId = useId()
  const normalized = useMemo(() => options.map(toOption), [options])
  const selected = useMemo(
    () => normalized.find((o) => o.value === value) ?? (value ? { value, label: value } : null),
    [normalized, value],
  )

  const input = (params: React.ComponentProps<typeof TextField>) => (
    <TextField
      {...params}
      {...textFieldProps}
      label={label}
      required={required}
      placeholder={placeholder}
      error={error}
      helperText={helperText}
      inputProps={{ ...params.inputProps, ...(textFieldProps?.inputProps || {}) }}
    />
  )

  const common = {
    id: reactId,
    fullWidth,
    size,
    disabled,
    autoHighlight: true,
    selectOnFocus: true,
    handleHomeEndKeys: true,
    options: normalized,
    getOptionLabel: (o: string | SelectOption) => (typeof o === 'string' ? o : o.label),
    filterOptions: filter,
    renderOption,
    sx,
  }

  if (freeSolo) {
    return (
      <Autocomplete
        {...common}
        freeSolo
        // The typed text is the source of truth for the value.
        inputValue={value}
        onInputChange={(_, v, reason) => {
          if (reason !== 'reset') onChange(v)
        }}
        onChange={(_, v) => {
          if (v == null) onChange('')
          else if (typeof v === 'string') onChange(v)
          else onChange(v.value)
        }}
        renderInput={input}
      />
    )
  }

  return (
    <Autocomplete
      {...common}
      // Force clear button off when the field is required so users can't empty a required value by mistake.
      disableClearable={required}
      value={selected}
      isOptionEqualToValue={(o, v) => o.value === v.value}
      onChange={(_, v) => onChange(v ? v.value : '')}
      renderInput={input}
    />
  )
}

export default SearchableSelect
