import { DashboardCharts } from './components/dashboard-charts';
import { DashboardEmptyState } from './components/dashboard-empty-state';
import { DashboardLoading } from './components/dashboard-loading';
import { DashboardMetrics } from './components/dashboard-metrics';
import { RetryCard } from '@components/retry-card';
import { useGetDashboardMetricsQuery } from '@store/api/api.generated';

export function DashboardPage() {
  const getDashboardMetrics = useGetDashboardMetricsQuery(undefined, {
    refetchOnFocus: true,
  });

  if (getDashboardMetrics.isError) {
    return (
      <RetryCard
        title="Não foi possível carregar o dashboard."
        description="Verifique sua conexão e tente novamente."
        onRetry={getDashboardMetrics.refetch}
      />
    );
  }

  if (getDashboardMetrics.isLoading || !getDashboardMetrics.data)
    return <DashboardLoading />;

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Visão geral</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
          Dashboard agrícola
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe a base registrada e a distribuição da operação agrícola.
        </p>
      </div>

      <DashboardMetrics data={getDashboardMetrics.data} />
      {getDashboardMetrics.data.farmCount === 0 ? <DashboardEmptyState /> : null}
      <DashboardCharts data={getDashboardMetrics.data} />
    </div>
  );
}
