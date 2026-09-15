import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { ProducerForm } from './producer-form'

describe('producer form', () => {
  it('should be able to format a partial CPF while typing', () => {
    render(<ProducerForm onSubmit={vi.fn()} />)

    const input = screen.getByLabelText('CPF ou CNPJ')
    fireEvent.change(input, { target: { value: '529982' } })
    expect(input).toHaveValue('529.982')

    fireEvent.change(input, { target: { value: '52998224725' } })

    expect(input).toHaveValue('529.982.247-25')
  })

  it('should be able to format a partial CNPJ while typing', () => {
    render(<ProducerForm onSubmit={vi.fn()} />)

    const input = screen.getByLabelText('CPF ou CNPJ')
    fireEvent.change(input, { target: { value: '112223330001' } })
    expect(input).toHaveValue('11.222.333/0001')

    fireEvent.change(input, { target: { value: '11222333000181' } })

    expect(input).toHaveValue('11.222.333/0001-81')
  })

  it('should expose invalid fields and their messages when submitted empty', async () => {
    render(<ProducerForm onSubmit={vi.fn()} />)

    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    await waitFor(() => {
      expect(screen.getByLabelText('Nome completo ou razão social')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByLabelText('CPF ou CNPJ')).toHaveAttribute('aria-invalid', 'true')
      expect(screen.getByText('Informe o nome do produtor.')).toBeInTheDocument()
      expect(screen.getByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()
      expect(document.querySelectorAll('[data-invalid]')).toHaveLength(2)
    })
  })
})
