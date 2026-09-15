import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'

import { FarmForm } from './farm-form'

describe('farm form', () => {
  it('should be able to submit a farm with converted area values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    render(<FarmForm producerId="producer-1" onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Sol' } })
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Salvador' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'ba' } })
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100,5' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '20,5' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    await waitFor(() => expect(onSubmit).toHaveBeenCalledWith({
      name: 'Fazenda Sol',
      producerId: 'producer-1',
      city: 'Salvador',
      state: 'BA',
      totalArea: 100.5,
      arableArea: 60,
      vegetationArea: 20.5,
    }))
  })

  it('should expose validation messages when area allocation exceeds the total', async () => {
    render(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Sol' } })
    fireEvent.change(screen.getByLabelText('Cidade'), { target: { value: 'Salvador' } })
    fireEvent.change(screen.getByLabelText('Estado'), { target: { value: 'BA' } })
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    expect(await screen.findByText('As áreas agricultável e de vegetação não podem ultrapassar a área total.')).toBeInTheDocument()
  })
})
