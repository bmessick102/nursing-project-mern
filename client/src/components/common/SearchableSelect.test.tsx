import React, { useState } from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import SearchableSelect from './SearchableSelect'

// A tiny controlled harness so the component behaves like it does at real call sites.
const Harness: React.FC<{
  freeSolo?: boolean
  required?: boolean
  initial?: string
  options?: Array<string | { value: string; label: string }>
}> = ({ freeSolo, required, initial = '', options }) => {
  const [value, setValue] = useState(initial)
  return (
    <>
      <SearchableSelect
        label="Fruit"
        value={value}
        onChange={setValue}
        freeSolo={freeSolo}
        required={required}
        options={
          options ?? [
            { value: 'apple', label: 'Apple' },
            { value: 'banana', label: 'Banana' },
            { value: 'cherry', label: 'Cherry' },
          ]
        }
      />
      <span data-testid="value">{value}</span>
    </>
  )
}

const getInput = () => screen.getByLabelText('Fruit', { selector: 'input' })

describe('SearchableSelect', () => {
  it('renders a labeled, searchable text input', () => {
    render(<Harness />)
    expect(getInput()).toBeInTheDocument()
  })

  it('filters options as the user types and selects by value', () => {
    render(<Harness />)
    const input = getInput()
    input.focus()
    fireEvent.change(input, { target: { value: 'ban' } })

    // Only the matching option remains after filtering.
    const options = screen.getAllByRole('option')
    expect(options).toHaveLength(1)
    expect(options[0]).toHaveTextContent('Banana')

    fireEvent.click(options[0])
    // onChange receives the option's *value*, not its label.
    expect(screen.getByTestId('value')).toHaveTextContent('banana')
  })

  it('shows the current value label when preselected', () => {
    render(<Harness initial="cherry" />)
    expect(getInput()).toHaveValue('Cherry')
  })

  it('commits arbitrary typed text in freeSolo mode', () => {
    render(<Harness freeSolo initial="" options={['5 mg', '10 mg']} />)
    const input = getInput()
    fireEvent.change(input, { target: { value: '7.5 mg' } })
    // The typed string is the value even though it is not in the option list.
    expect(screen.getByTestId('value')).toHaveTextContent('7.5 mg')
  })

  it('omits the clear button when required', () => {
    render(<Harness required initial="apple" />)
    expect(screen.queryByLabelText('Clear')).not.toBeInTheDocument()
  })
})
