import type { LucideIcon } from 'lucide-react'

import { Card, CardContent, CardDescription, CardHeader } from '@components/ui/card'

type DashboardMetricCardProps = {
  label: string
  value: string
  icon: LucideIcon
};

export function DashboardMetricCard({
  label,
  value,
  icon: Icon,
}: DashboardMetricCardProps) {
  return (
    <Card>
      <CardHeader className="flex-row items-center justify-between space-y-0">
        <CardDescription>{label}</CardDescription>
        <Icon className="size-5 text-primary" aria-hidden="true" />
      </CardHeader>
      <CardContent>
        <p className="text-2xl font-semibold">{value}</p>
      </CardContent>
    </Card>
  )
}
