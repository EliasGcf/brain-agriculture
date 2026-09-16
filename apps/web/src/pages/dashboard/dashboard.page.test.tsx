import { fireEvent, render, screen, waitFor, within } from '@testing-library/react'
import { http, HttpResponse } from 'msw'

import { ChartContainer, ChartTooltipContent } from '@components/ui/chart'
import { renderWithProviders } from '../../../tests/test-utils'
import { server } from '../../../tests/mocks/server'
import { DashboardPage } from './dashboard.page'
import { DashboardOtherTooltip } from './components/dashboard-charts'

const baseUrl = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, '')

describe('DashboardPage', () => {
  it('should be able to show the chart label and formatted value in the tooltip', () => {
    render(
      <ChartContainer config={{ state: { label: 'São Paulo', color: 'red' } }}>
        <ChartTooltipContent
          active
          hideLabel
          nameKey="state"
          payload={[{ dataKey: 'hectares', graphicalItemId: '', name: 'state', value: 775.5, payload: { state: 'state' } }]}
          valueFormatter={(value) => `${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })} ha`}
        />
      </ChartContainer>,
    )

    expect(screen.getByText('São Paulo')).toBeInTheDocument()
    expect(screen.getByText('775,50 ha')).toBeInTheDocument()
  })

  it('should be able to load dashboard metrics from the API', async () => {
    server.use(
      http.get(`${baseUrl}/metrics`, () =>
        HttpResponse.json({
          farmCount: 7,
          producerCount: 5,
          totalHectares: 321.5,
          hectaresByState: [{ state: 'Bahia', hectares: 321.5 }],
          farmsByCrop: [{ crop: 'Cacau', farms: 7 }],
          landUse: { arableArea: 200, vegetationArea: 50, otherUses: 71.5 },
        }),
      ),
    )

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(screen.getByText('321,50 ha')).toBeInTheDocument()
    })
    const metrics = screen.getByRole('region', { name: 'Resumo da operação' })
    expect(within(metrics).getByText('7')).toBeInTheDocument()
    expect(within(metrics).getByText('5')).toBeInTheDocument()
    expect(screen.getByText(/Bahia.*321,50 ha/i)).toBeInTheDocument()
    expect(screen.getByText(/Cacau.*7 fazendas/i)).toBeInTheDocument()
  })

  it('should be able to show the operation totals and chart data', async () => {
    renderWithProviders(<DashboardPage />)

    await waitFor(() => expect(screen.getByText('100,00 ha')).toBeInTheDocument())
    const metrics = screen.getByRole('region', { name: 'Resumo da operação' })
    expect(within(metrics).getByText('1')).toBeInTheDocument()
    expect(within(metrics).getByText('3')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /hectares por estado/i })).toBeInTheDocument()
    expect(screen.getByText(/Área agricultável.*60,00 ha.*60%/i)).toBeInTheDocument()

    const landUseChart = screen.getByRole('img', { name: /uso do solo/i })
    expect(within(landUseChart).getByText('Área agricultável')).toBeVisible()
    expect(within(landUseChart).getByText('Vegetação')).toBeVisible()
    expect(within(landUseChart).getByText('Outros usos')).toBeVisible()

    expect(screen.getByRole('img', { name: /hectares por estado/i })).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /fazendas por cultura/i })).toBeInTheDocument()
  })

  it('should not be able to show color legends for state and crop charts', async () => {
    renderWithProviders(<DashboardPage />)

    await waitFor(() => expect(screen.getByText('100,00 ha')).toBeInTheDocument())

    expect(within(screen.getByRole('img', { name: /hectares por estado/i })).queryByRole('list')).not.toBeInTheDocument()
    expect(within(screen.getByRole('img', { name: /fazendas por cultura/i })).queryByRole('list')).not.toBeInTheDocument()
  })

  it('should be able to show numeric labels in state and crop charts', async () => {
    server.use(
      http.get(`${baseUrl}/metrics`, () =>
        HttpResponse.json({
          farmCount: 7,
          producerCount: 5,
          totalHectares: 321.5,
          hectaresByState: [{ state: 'Bahia', hectares: 321.5 }],
          farmsByCrop: [{ crop: 'Cacau', farms: 7 }],
          landUse: { arableArea: 200, vegetationArea: 50, otherUses: 71.5 },
        }),
      ),
    )

    renderWithProviders(<DashboardPage />)

    await waitFor(() => {
      expect(within(screen.getByRole('img', { name: /hectares por estado/i })).getByText('321,50')).toBeVisible()
    })
    expect(within(screen.getByRole('img', { name: /fazendas por cultura/i })).getByText('7')).toBeVisible()
  })

  it('should be able to show the complete list inside the other states tooltip', () => {
    render(
      <DashboardOtherTooltip
        active
        payload={[
          {
            dataKey: 'hectares',
            graphicalItemId: '',
            name: 'Outros estados',
            value: 75,
            payload: {
              details: [
                { label: 'BA', value: 50 },
                { label: 'CE', value: 25 },
              ],
            },
          },
        ]}
        valueFormatter={(value) => `${Number(value).toLocaleString('pt-BR')} ha`}
      />,
    )

    expect(screen.getByText('Outros estados')).toBeInTheDocument()
    expect(screen.getByText(/Total:.*75 ha/)).toBeInTheDocument()
    expect(screen.getByText(/BA:.*50 ha/)).toBeInTheDocument()
    expect(screen.getByText(/CE:.*25 ha/)).toBeInTheDocument()
  })

  it('should be able to explain when there is no chart data', async () => {
    server.use(
      http.get(`${baseUrl}/metrics`, () =>
        HttpResponse.json({
          farmCount: 0,
          producerCount: 0,
          totalHectares: 0,
          hectaresByState: [],
          farmsByCrop: [],
          landUse: { arableArea: 0, vegetationArea: 0, otherUses: 0 },
        }),
      ),
    )

    renderWithProviders(<DashboardPage />)

    await waitFor(() => expect(screen.getAllByText(/nenhum dado disponível/i)).toHaveLength(3))
    expect(screen.getByText('Ainda não há fazendas cadastradas.')).toBeInTheDocument()
  })

  it('should be able to show a loading state', async () => {
    server.use(
      http.get(`${baseUrl}/metrics`, async () => {
        await new Promise((resolve) => setTimeout(resolve, 50))
        return HttpResponse.json({
          farmCount: 0,
          producerCount: 0,
          totalHectares: 0,
          hectaresByState: [],
          farmsByCrop: [],
          landUse: { arableArea: 0, vegetationArea: 0, otherUses: 0 },
        })
      }),
    )

    renderWithProviders(<DashboardPage />)

    expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()
    await waitFor(() => expect(screen.getByRole('heading', { name: 'Dashboard agrícola' })).toBeInTheDocument())
  })

  it('should be able to retry after a dashboard error', async () => {
    let requestCount = 0
    server.use(
      http.get(`${baseUrl}/metrics`, () => {
        requestCount += 1
        return HttpResponse.json({ message: 'Service unavailable' }, { status: 500 })
      }),
    )

    renderWithProviders(<DashboardPage />)

    await waitFor(() => expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o dashboard.'))
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    await waitFor(() => expect(requestCount).toBe(2))
  })
})
