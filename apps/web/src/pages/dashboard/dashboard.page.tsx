import type { DashboardStatus } from './dashboard-status'
import { DashboardCharts } from './components/dashboard-charts'
import { DashboardEmptyState } from './components/dashboard-empty-state'
import { DashboardError } from './components/dashboard-error'
import { DashboardLoading } from './components/dashboard-loading'
import { DashboardMetrics } from './components/dashboard-metrics'
import { dashboardData, type DashboardData } from './dashboard-data'

export type { DashboardStatus } from './dashboard-status'

type DashboardPageProps = {
  data?: DashboardData
  status?: DashboardStatus
  onRetry?: () => void
}

export function DashboardPage({ data = dashboardData, status = 'success', onRetry }: DashboardPageProps) {
  if (status === 'loading') return <DashboardLoading />
  if (status === 'error') return <DashboardError onRetry={onRetry} />

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Visão geral</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard agrícola</h1>
        <p className="mt-1 text-sm text-muted-foreground">Acompanhe a base registrada e a distribuição da operação agrícola.</p>
      </div>

      <DashboardMetrics data={data} />
      {data.farmCount === 0 ? <DashboardEmptyState /> : null}
      <DashboardCharts data={data} />
    </div>
  )
}
