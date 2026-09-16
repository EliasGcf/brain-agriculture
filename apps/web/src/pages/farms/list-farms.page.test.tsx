import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { MemoryRouter, Route, Routes } from 'react-router'
import { CreateFarmPage } from './create-farm.page'

import { FarmsPage } from './list-farms.page'
import { renderWithProviders } from '../../../tests/test-utils'
import { server } from '../../../tests/mocks/server'
import { env } from "@env"

const farmsUrl = `${(env.VITE_API_BASE_URL || '').replace(/\/+$/, '')}/farms`

describe('farms page', () => {
  it('should be able to see farms returned by the global farms endpoint', async () => {
    server.use(
      http.get(farmsUrl, () =>
        HttpResponse.json({
          items: [
            {
              id: 'farm-global',
              name: 'Global Farm',
              producerId: 'producer-1',
              city: 'Salvador',
              state: 'BA',
              totalArea: 100,
              arableArea: 60,
              vegetationArea: 20,
              createdAt: '2026-01-01T00:00:00.000Z',
            },
          ],
          total: 1,
        }),
      ),
    )

    renderWithProviders(
      <MemoryRouter initialEntries={['/farms']}>
        <Routes>
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/new" element={<CreateFarmPage />} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByText('Global Farm')).toBeInTheDocument()
    expect(screen.getByText('Salvador, BA')).toBeInTheDocument()
  })

  it('should be able to navigate to the farm creation flow', () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/farms']}>
        <Routes>
          <Route path="/farms" element={<FarmsPage />} />
          <Route path="/farms/new" element={<CreateFarmPage />} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Adicionar fazenda' }))

    expect(screen.getByText('Nova fazenda')).toBeInTheDocument()
  })
})
