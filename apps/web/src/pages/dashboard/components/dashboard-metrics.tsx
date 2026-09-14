import { AreaChart, MapPinned, Wheat } from 'lucide-react'

import { DashboardMetricCard } from './dashboard-metric-card'
import { formatCount, formatNumber } from '../dashboard-formatters'
import type { DashboardData } from '../dashboard-data'

export function DashboardMetrics({ data }: { data: DashboardData }) {
  const metrics = [
    { label: 'Fazendas cadastradas', value: formatCount(data.farmCount), icon: MapPinned },
    { label: 'Hectares registrados', value: `${formatNumber(data.totalHectares)} ha`, icon: AreaChart },
    { label: 'Produtores ativos', value: formatCount(data.producerCount), icon: Wheat },
  ]

  return (
    <section aria-label="Resumo da operação" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      {metrics.map((metric) => <DashboardMetricCard key={metric.label} {...metric} />)}
    </section>
  )
}
