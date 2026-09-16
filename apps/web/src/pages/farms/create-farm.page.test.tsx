import { fireEvent, screen, waitFor } from '@testing-library/react'
import { afterEach, beforeEach } from 'vitest'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CreateFarmPage } from './create-farm.page'
import { EditFarmPage } from './edit-farm.page'
import { renderWithProviders } from '../../../tests/test-utils'

describe('create farm page', () => {
  const originalResizeObserver = globalThis.ResizeObserver

  beforeEach(() => {
    globalThis.ResizeObserver = class {
      observe() {}
      unobserve() {}
      disconnect() {}
    }
  })

  afterEach(() => {
    globalThis.ResizeObserver = originalResizeObserver
  })

  it('should be able to save a farm and navigate to its edit page', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/farms/new']}>
        <Routes>
          <Route path="/farms/new" element={<CreateFarmPage />} />
          <Route path="/farms/:farmId" element={<EditFarmPage />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(screen.getByLabelText('Nome da fazenda'), { target: { value: 'Fazenda Sol' } })
    fireEvent.click(screen.getByRole('combobox', { name: 'Produtor' }))
    fireEvent.click(await screen.findByRole('option', { name: /Ada Rural/ }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Estado' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Bahia' }))
    fireEvent.keyDown(screen.getByRole('combobox', { name: 'Cidade' }), { key: 'ArrowDown' })
    fireEvent.click(await screen.findByRole('option', { name: 'Salvador' }))
    fireEvent.change(screen.getByLabelText('Área total (ha)'), { target: { value: '100' } })
    fireEvent.change(screen.getByLabelText('Área agricultável (ha)'), { target: { value: '60' } })
    fireEvent.change(screen.getByLabelText('Área de vegetação (ha)'), { target: { value: '20' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    await waitFor(() => expect(screen.getByText('Fazenda Sol')).toBeInTheDocument())
  })
})
