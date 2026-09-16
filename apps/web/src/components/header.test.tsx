import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { AppRoutes } from '../routes'
import { renderWithProviders } from '../../tests/test-utils'
import { server } from '../../tests/mocks/server'
import { env } from '@env'

describe('header', () => {
  it('should be able to logout the authenticated user', async () => {
    let meRequests = 0
    server.use(http.get(`${env.VITE_API_BASE_URL}/me`, () => {
      meRequests += 1
      return meRequests === 1
        ? HttpResponse.json({ ok: true })
        : HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
    }))

    window.history.pushState({}, '', '/')
    renderWithProviders(<AppRoutes />)

    fireEvent.click(await screen.findByRole('button', { name: 'Sair' }))

    await waitFor(() => expect(window.location.pathname).toBe('/login'))
  })
})
