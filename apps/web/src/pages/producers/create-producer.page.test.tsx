import { fireEvent, screen, waitFor } from '@testing-library/react'
import { http, HttpResponse } from 'msw'
import { describe, expect, it } from 'vitest'

import { AppRoutes } from '../../routes'
import { renderWithProviders } from '../../../tests/test-utils'
import { server } from '../../../tests/mocks/server'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

function renderCreateProducer() {
  window.history.pushState({}, '', '/producers/new')
  return renderWithProviders(<AppRoutes />)
}

describe('producer create route', () => {
  it('should not be able to submit an invalid document', async () => {
    let requestWasSent = false
    server.use(http.post(`${baseUrl}/producers`, () => {
      requestWasSent = true
      return HttpResponse.json({}, { status: 201 })
    }))

    renderCreateProducer()
    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), { target: { value: 'Novo Produtor' } })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), { target: { value: '11111111111' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))
    expect(await screen.findByText('Informe um CPF ou CNPJ válido.')).toBeInTheDocument()
    expect(window.location.pathname).toBe('/producers/new')
    expect(requestWasSent).toBe(false)
  })

  it('should be able to create a producer through the API and navigate to the producer list', async () => {
    renderCreateProducer()
    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), { target: { value: 'Novo Produtor' } })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), { target: { value: '529.982.247-25' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))
    await waitFor(() => expect(window.location.pathname).toBe('/producers'), { timeout: 3000 })
    expect(await screen.findByRole('heading', { name: 'Produtores' })).toBeInTheDocument()
  })

  it('should be able to submit a formatted CNPJ to the API', async () => {
    let requestBody: unknown
    server.use(http.post(`${baseUrl}/producers`, async ({ request }) => {
      requestBody = await request.json()
      return HttpResponse.json({
        id: '00000000-0000-4000-8000-000000000010',
        name: 'Novo Produtor',
        document: {
          type: 'cnpj',
          value: '11222333000181',
          formatted: '11.222.333/0001-81',
        },
        createdAt: '2026-01-01T00:00:00.000Z',
      }, { status: 201 })
    }))

    renderCreateProducer()
    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), { target: { value: 'Novo Produtor' } })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), { target: { value: '11.222.333/0001-81' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))

    await waitFor(() => expect(window.location.pathname).toBe('/producers'), { timeout: 3000 })
    expect(requestBody).toEqual({ name: 'Novo Produtor', document: '11.222.333/0001-81' })
  })

  it('should display a toast when the server rejects the document', async () => {
    server.use(http.post(`${baseUrl}/producers`, () => HttpResponse.json({ message: 'Document already exists' }, { status: 409 })))
    renderCreateProducer()
    fireEvent.change(screen.getByLabelText('Nome completo ou razão social'), { target: { value: 'Novo Produtor' } })
    fireEvent.change(screen.getByLabelText('CPF ou CNPJ'), { target: { value: '52998224725' } })
    fireEvent.click(screen.getByRole('button', { name: 'Salvar produtor' }))
    expect(await screen.findByText('Este CPF ou CNPJ já está cadastrado.', undefined, { timeout: 3000 })).toBeInTheDocument()
    expect(window.location.pathname).toBe('/producers/new')
  })
})
