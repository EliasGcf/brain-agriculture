import { fireEvent, screen } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AppRoutes } from '../../routes'
import { renderWithProviders } from '../../../tests/test-utils'
import { server } from '../../../tests/mocks/server'
import { env } from "@env"

const FARM_ID = '00000000-0000-4000-8000-000000000002'
const baseUrl = env.VITE_API_BASE_URL.replace(/\/+$/, '')

function renderAt(path: string) {
  window.history.pushState({}, '', path)
  return renderWithProviders(<AppRoutes />)
}

describe('farm detail route', () => {
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

  it('should be able to load and update a farm through the API', async () => {
    renderAt(`/farms/${FARM_ID}`)

    expect(await screen.findByRole('heading', { name: 'Green Acres' })).toBeInTheDocument()
    expect(await screen.findByDisplayValue('2026 Harvest')).toBeInTheDocument()
    fireEvent.click(
      screen.getByRole('button', { name: 'Expandir safra 2026 Harvest' }),
    )
    expect(await screen.findByDisplayValue('Corn')).toBeInTheDocument()
    fireEvent.change(screen.getByLabelText('Nome da fazenda'), {
      target: { value: 'Green Acres Atualizada' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    expect(
      await screen.findByRole('heading', { name: 'Green Acres Atualizada' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(`/farms/${FARM_ID}`)
  })

  it('should be able to delete a farm and return to the farm list', async () => {
    renderAt(`/farms/${FARM_ID}`)

    expect(await screen.findByRole('heading', { name: 'Green Acres' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Excluir fazenda' }))
    fireEvent.click(screen.getByRole('button', { name: /^Excluir fazenda$/ }))

    expect(await screen.findByRole('heading', { name: 'Fazendas' })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/farms')
  })

  it('should be able to show the farm form while harvests are loading', async () => {
    server.use(
      http.get(`${baseUrl}/farms/${FARM_ID}/harvests`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 100))
        return HttpResponse.json([])
      }),
    )

    renderAt(`/farms/${FARM_ID}`)

    expect(await screen.findByRole('heading', { name: 'Green Acres' })).toBeInTheDocument()
    expect(screen.getByLabelText('Carregando safras')).toBeInTheDocument()
  })

  it('should be able to retry loading harvests from the harvests section', async () => {
    let attempts = 0
    server.use(
      http.get(`${baseUrl}/farms/${FARM_ID}/harvests`, () => {
        attempts += 1
        return attempts === 1
          ? HttpResponse.json({ message: 'Temporary error' }, { status: 500 })
          : HttpResponse.json([])
      }),
    )

    renderAt(`/farms/${FARM_ID}`)

    expect(
      await screen.findByText('Não foi possível carregar as safras.'),
    ).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))

    expect(await screen.findByRole('heading', { name: 'Safras' })).toBeInTheDocument()
  })
})
