import { fireEvent, render, screen, within } from '@testing-library/react'

import { ChartContainer, ChartTooltipContent } from '@components/ui/chart'
import { DashboardPage } from './dashboard.page'
import type { DashboardData } from './dashboard-data'

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

  it('should be able to show the operation totals and chart data', () => {
    render(<DashboardPage />)

    expect(screen.getByText('24')).toBeInTheDocument()
    expect(screen.getByText('1.248,50 ha')).toBeInTheDocument()
    expect(screen.getByText('18')).toBeInTheDocument()
    expect(screen.getByRole('img', { name: /hectares por estado/i })).toBeInTheDocument()
    expect(screen.getByText(/São Paulo.*775,50 ha.*62%/i)).toBeInTheDocument()
    expect(screen.getByText(/Soja.*12 fazendas.*50%/i)).toBeInTheDocument()
    expect(screen.getByText(/Área agricultável.*886,50 ha.*71%/i)).toBeInTheDocument()

    const landUseChart = screen.getByRole('img', { name: /uso do solo/i })
    expect(within(landUseChart).getByText('Área agricultável')).toBeVisible()
    expect(within(landUseChart).getByText('Vegetação')).toBeVisible()
    expect(within(landUseChart).getByText('Outros usos')).toBeVisible()

    const stateChart = screen.getByRole('img', { name: /hectares por estado/i })
    expect(within(stateChart).getByText('São Paulo')).toBeVisible()

    const cropChart = screen.getByRole('img', { name: /fazendas por cultura/i })
    expect(within(cropChart).getByText('Soja')).toBeVisible()
  })

  it('should be able to explain when there is no chart data', () => {
    const emptyData: DashboardData = {
      farmCount: 0,
      producerCount: 0,
      totalHectares: 0,
      hectaresByState: [],
      farmsByCrop: [],
      landUse: { arableArea: 0, vegetationArea: 0, otherUses: 0 },
    }

    render(<DashboardPage data={emptyData} />)

    expect(screen.getAllByText(/nenhum dado disponível/i)).toHaveLength(3)
    expect(screen.getByText('Ainda não há fazendas cadastradas.')).toBeInTheDocument()
  })

  it('should be able to show a loading state', () => {
    const { rerender } = render(<DashboardPage status="loading" />)
    expect(screen.getByText('Carregando dashboard...')).toBeInTheDocument()

    rerender(<DashboardPage />)
    expect(screen.getByRole('heading', { name: 'Dashboard agrícola' })).toBeInTheDocument()
  })

  it('should be able to retry after a dashboard error', () => {
    const onRetry = vi.fn()
    render(<DashboardPage status="error" onRetry={onRetry} />)

    expect(screen.getByRole('alert')).toHaveTextContent('Não foi possível carregar o dashboard.')
    fireEvent.click(screen.getByRole('button', { name: 'Tentar novamente' }))
    expect(onRetry).toHaveBeenCalledOnce()
  })
})
