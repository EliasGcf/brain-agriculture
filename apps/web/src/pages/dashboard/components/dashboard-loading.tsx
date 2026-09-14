import { Skeleton } from '@components/ui/skeleton'

export function DashboardLoading() {
  return (
    <div aria-busy="true" className="space-y-6">
      <p className="text-sm text-muted-foreground">Carregando dashboard...</p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-28" />)}</div>
      <div className="grid gap-4 xl:grid-cols-3">{[1, 2, 3].map((item) => <Skeleton key={item} className="h-80" />)}</div>
    </div>
  )
}
