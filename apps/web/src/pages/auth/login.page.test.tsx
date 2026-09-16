import { fireEvent, screen, waitFor } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router'

import { LoginPage } from './login.page'
import { renderWithProviders } from '../../../tests/test-utils'
import { PublicOnlyGuard } from '../../components/auth-guard'
import { AppRoutes } from '../../routes'
import { server } from '../../../tests/mocks/server'
import { env } from '@env'
import { http, HttpResponse } from 'msw'

describe('login page', () => {
  it('should not be able to submit without valid credentials', async () => {
    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <LoginPage />
      </MemoryRouter>,
    )

    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    expect(await screen.findByText('Informe um email válido.')).toBeInTheDocument()
    expect(screen.getByText('Informe a senha.')).toBeInTheDocument()
  })

  it('should be able to authenticate with email and password', async () => {
    let meRequests = 0
    server.use(http.get(`${env.VITE_API_BASE_URL}/me`, () => {
      meRequests += 1
      return meRequests === 1
        ? HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        : HttpResponse.json({ ok: true })
    }))

    renderWithProviders(
      <MemoryRouter initialEntries={['/login']}>
        <Routes>
          <Route element={<PublicOnlyGuard />}>
            <Route path="/login" element={<LoginPage />} />
          </Route>
          <Route path="/" element={<h1>Dashboard</h1>} />
        </Routes>
      </MemoryRouter>,
    )

    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'admin@admin.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard' })).toBeInTheDocument())
  })

  it('should be able to return to the originally requested protected route after authentication', async () => {
    let meRequests = 0
    server.use(http.get(`${env.VITE_API_BASE_URL}/me`, () => {
      meRequests += 1
      return meRequests === 1
        ? HttpResponse.json({ message: 'Unauthorized' }, { status: 401 })
        : HttpResponse.json({ ok: true })
    }))
    window.history.pushState({}, '', '/farms')

    renderWithProviders(<AppRoutes />)

    await waitFor(() => {
      expect(window.location.pathname).toBe('/login')
      expect(new URLSearchParams(window.location.search).get('redirect')).toBe('/farms')
    })

    fireEvent.change(await screen.findByLabelText('Email'), { target: { value: 'admin@admin.com' } })
    fireEvent.change(screen.getByLabelText('Senha'), { target: { value: '12345678' } })
    fireEvent.click(screen.getByRole('button', { name: 'Entrar' }))

    await waitFor(() => expect(screen.getByRole('heading', { name: 'Fazendas' })).toBeInTheDocument())
  })
})
