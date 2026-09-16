import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import { FarmForm } from './farm-form'
import { renderWithProviders } from '../../tests/test-utils'

describe('farm form', () => {
  const originalResizeObserver = globalThis.ResizeObserver

  beforeEach(() => {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    } as typeof ResizeObserver
  })

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver
  })

  it('should be able to submit a farm with converted area values', async () => {
    const onSubmit = vi.fn().mockResolvedValue(undefined)

    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={onSubmit} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Sol' } })
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Bahia' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Cidade' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Salvador' }))
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100.5' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '20.5' } })
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
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Sol' } })
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Bahia' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Cidade' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Salvador' }))
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '80' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '30' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    expect(await screen.findByText('As áreas agricultável e de vegetação não podem ultrapassar a área total.')).toBeInTheDocument()
  })

  it('should be able to choose a city from the selected state locality data', async () => {
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })
    expect(await screen.findByRole('option', { name: 'Bahia' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('option', { name: 'Bahia' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Cidade' }), { key: 'ArrowDown' })

    expect(await screen.findByRole('option', { name: 'Salvador' })).toBeInTheDocument()
  })

  it('should not display the empty state when states are available', async () => {
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })

    expect(await screen.findByRole('option', { name: 'Bahia' })).toBeInTheDocument()
    expect(screen.queryByText('Nenhum estado encontrado.')).not.toBeInTheDocument()
  })

  it('should be able to filter states by name', async () => {
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })
    expect(await screen.findByRole('option', { name: 'Bahia' })).toBeInTheDocument()

    fireEvent.change(screen.getByRole('combobox', { name: 'Estado' }), {
      target: { value: 'Bahia' },
    })

    expect(screen.getByRole('option', { name: 'Bahia' })).toBeInTheDocument()
    expect(screen.getAllByRole('option')).toHaveLength(1)
    await waitFor(() => expect(screen.queryByRole('option', { name: 'Rondônia' })).not.toBeInTheDocument())
  })

  it('should render area fields as number inputs', () => {
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.getByLabelText('Área total (ha)')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('Área agricultável (ha)')).toHaveAttribute('type', 'number')
    expect(screen.getByLabelText('Área de vegetação (ha)')).toHaveAttribute('type', 'number')
  })

  it('should limit area values to two decimal places', () => {
    renderWithProviders(<FarmForm producerId="producer-1" onSubmit={vi.fn()} onCancel={vi.fn()} />)

    const totalArea = screen.getByLabelText('Área total (ha)')
    fireEvent.change(totalArea, { target: { value: '12.345' } })

    expect(totalArea).toHaveValue(12.34)
  })

  it('should be able to search producers by name in the async select', async () => {
    renderWithProviders(<FarmForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    fireEvent.click(screen.getByRole('combobox', { name: 'Produtor' }))
    const search = screen.getByPlaceholderText('Search produtor...')
    fireEvent.change(search, { target: { value: 'Ada' } })

    expect(await screen.findByRole('option', { name: /Ada Rural/ })).toBeInTheDocument()
  })

  it('should not display harvest controls before the farm is saved', () => {
    renderWithProviders(<FarmForm onSubmit={vi.fn()} onCancel={vi.fn()} />)

    expect(screen.queryByRole('heading', { name: 'Safras' })).not.toBeInTheDocument()
    expect(screen.queryByRole('button', { name: 'Adicionar safra' })).not.toBeInTheDocument()
  })

})
