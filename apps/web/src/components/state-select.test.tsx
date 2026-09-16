import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { StateSelect } from './state-select'

describe('state select', () => {
  it('should filter states and return the selected UF', () => {
    const onValueChange = vi.fn()

    render(
      <StateSelect value="" onValueChange={onValueChange} />,
    )

    const input = screen.getByRole('combobox', { name: 'Estado' })
    fireEvent.keyDown(input, { key: 'ArrowDown' })
    fireEvent.change(input, { target: { value: 'Bahia' } })

    expect(screen.getByRole('option', { name: 'Bahia' })).toBeInTheDocument()
    expect(screen.queryByRole('option', { name: 'Rondônia' })).not.toBeInTheDocument()

    fireEvent.click(screen.getByRole('option', { name: 'Bahia' }))

    expect(onValueChange).toHaveBeenCalledWith('BA')
  })
})
