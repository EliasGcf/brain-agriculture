import { fireEvent, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it } from 'vitest'

import { AppRoutes } from '../../routes'
import { renderWithProviders } from '../../../tests/test-utils'

const FARM_ID = '00000000-0000-4000-8000-000000000002'

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
    fireEvent.change(screen.getByLabelText('Nome da fazenda'), {
      target: { value: 'Green Acres Atualizada' },
    })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar fazenda' }))

    expect(
      await screen.findByRole('heading', { name: 'Green Acres Atualizada' }),
    ).toBeInTheDocument()
    expect(window.location.pathname).toBe(`/farms/${FARM_ID}`)
  })
})
