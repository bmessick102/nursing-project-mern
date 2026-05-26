import React from 'react'
import { render, screen } from '@testing-library/react'
import ErrorBoundary from './ErrorBoundary'

const Boom = () => {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div>healthy content</div>
      </ErrorBoundary>,
    )
    expect(screen.getByText('healthy content')).toBeInTheDocument()
  })

  it('renders the fallback when a child throws', () => {
    // Silence the expected error log from React's boundary.
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {})
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: /return to home/i })).toBeInTheDocument()
    spy.mockRestore()
  })
})
