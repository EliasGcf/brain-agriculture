import { screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'
import { http, HttpResponse } from 'msw'

import { AuthGuard } from './auth-guard'
import { renderWithProviders } from '../../tests/test-utils'
import { server } from '../../tests/mocks/server'
import { env } from '@env'

describe('auth guard', () => {
  it('should be able to render a protected route when the user is authenticated', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/protected" element={<h1>Protected content</h1>} />
          </Route>
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    expect(await screen.findByRole('heading', { name: 'Protected content' })).toBeInTheDocument()
  })

  it('should redirect unauthenticated users to login', async () => {
    server.use(http.get(`${env.VITE_API_BASE_URL}/me`, () =>
      HttpResponse.json({ message: 'Unauthorized' }, { status: 401 }),
    ))

    renderWithProviders(
      <MemoryRouter initialEntries={['/protected']}>
        <Routes>
          <Route element={<AuthGuard />}>
            <Route path="/protected" element={<h1>Protected content</h1>} />
          </Route>
          <Route path="/login" element={<h1>Login</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Login' })).toBeInTheDocument())
    expect(screen.queryByRole('heading', { name: 'Protected content' })).not.toBeInTheDocument()
  })
})
