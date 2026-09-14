import { Legend, Pie, PieChart } from 'recharts';

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@components/ui/chart';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card';
import { DashboardChartAlternative } from './dashboard-chart-alternative';
import { DashboardEmptyChart } from './dashboard-empty-chart';
import { formatCount, formatNumber, formatPercentage } from '../dashboard-formatters';
import type { DashboardData } from '../dashboard-data';

const landUseChartConfig = {
  arableArea: { label: 'Área agricultável', color: 'var(--chart-1)' },
  vegetationArea: { label: 'Vegetação', color: 'var(--chart-3)' },
  otherUses: { label: 'Outros usos', color: 'var(--chart-5)' },
} satisfies ChartConfig;

const landUseColors = [
  'var(--color-arableArea)',
  'var(--color-vegetationArea)',
  'var(--color-otherUses)',
];
const stateColors = ['var(--chart-1)', 'var(--chart-3)', 'var(--chart-5)'];
const cropColors = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-4)',
  'var(--chart-5)',
];

export function DashboardCharts({ data }: { data: DashboardData }) {
  const stateTotal = data.hectaresByState.reduce((sum, item) => sum + item.hectares, 0);
  const stateChartConfig = Object.fromEntries(
    data.hectaresByState.map((item) => [item.state, { label: item.state }]),
  ) as ChartConfig;
  const cropChartConfig = Object.fromEntries(
    data.farmsByCrop.map((item) => [item.crop, { label: item.crop }]),
  ) as ChartConfig;
  const stateChartData = data.hectaresByState.map((item, index) => ({
    ...item,
    fill: stateColors[index % stateColors.length],
  }));
  const cropChartData = data.farmsByCrop.map((item, index) => ({
    ...item,
    fill: cropColors[index % cropColors.length],
  }));
  const landUseData = [
    { name: 'Área agricultável', key: 'arableArea', value: data.landUse.arableArea, fill: landUseColors[0] },
    { name: 'Vegetação', key: 'vegetationArea', value: data.landUse.vegetationArea, fill: landUseColors[1] },
    { name: 'Outros usos', key: 'otherUses', value: data.landUse.otherUses, fill: landUseColors[2] },
  ];

  return (
    <section
      aria-label="Visualizações do dashboard"
      className="grid gap-4 xl:grid-cols-3"
    >
      <Card>
        <CardHeader>
          <CardTitle>Hectares por estado</CardTitle>
          <CardDescription>Área total das fazendas agrupada por estado.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.hectaresByState.length ? (
            <>
              <ChartContainer
                config={stateChartConfig}
                className="h-64 w-full"
                role="img"
                aria-label="Gráfico de pizza de hectares por estado"
              >
                <PieChart>
                  <ChartTooltip
                    isAnimationActive={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="state"
                        valueFormatter={(value) => `${formatNumber(Number(value))} ha`}
                      />
                    }
                  />
                  <Pie
                    data={stateChartData}
                    dataKey="hectares"
                    nameKey="state"
                    outerRadius={86}
                  >
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
              <DashboardChartAlternative>
                <ul>
                  {data.hectaresByState.map((item) => (
                    <li key={item.state}>
                      {item.state}: {formatNumber(item.hectares)} ha (
                      {formatPercentage(item.hectares, stateTotal)}%)
                    </li>
                  ))}
                </ul>
              </DashboardChartAlternative>
            </>
          ) : (
            <DashboardEmptyChart label="hectares por estado" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Fazendas por cultura</CardTitle>
          <CardDescription>
            Quantidade de fazendas distintas com cada cultura.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {data.farmsByCrop.length ? (
            <>
              <ChartContainer
                config={cropChartConfig}
                className="h-64 w-full"
                role="img"
                aria-label="Gráfico de pizza de fazendas por cultura"
              >
                <PieChart>
                  <ChartTooltip
                    isAnimationActive={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="crop"
                        valueFormatter={(value) =>
                          `${formatCount(Number(value))} fazendas`
                        }
                      />
                    }
                  />
                  <Pie
                    data={cropChartData}
                    dataKey="farms"
                    nameKey="crop"
                    outerRadius={86}
                  >
                  </Pie>
                  <Legend />
                </PieChart>
              </ChartContainer>
              <DashboardChartAlternative>
                <ul>
                  {data.farmsByCrop.map((item) => (
                    <li key={item.crop}>
                      {item.crop}: {formatCount(item.farms)} fazendas (
                      {formatPercentage(item.farms, data.farmCount)}% do total de
                      fazendas)
                    </li>
                  ))}
                </ul>
              </DashboardChartAlternative>
            </>
          ) : (
            <DashboardEmptyChart label="fazendas por cultura" />
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Uso do solo</CardTitle>
          <CardDescription>Distribuição da área total registrada.</CardDescription>
        </CardHeader>
        <CardContent>
          {data.totalHectares > 0 ? (
            <>
              <ChartContainer
                config={landUseChartConfig}
                className="h-64 w-full"
                role="img"
                aria-label="Gráfico de uso do solo"
              >
                <PieChart>
                  <ChartTooltip
                    isAnimationActive={false}
                    content={
                      <ChartTooltipContent
                        hideLabel
                        nameKey="key"
                        valueFormatter={(value) => `${formatNumber(Number(value))} ha`}
                      />
                    }
                  />
                  <Pie data={landUseData} dataKey="value" nameKey="key" outerRadius={86} />
                  <ChartLegend content={<ChartLegendContent nameKey="key" />} />
                </PieChart>
              </ChartContainer>
              <DashboardChartAlternative>
                <ul>
                  {landUseData.map((item) => (
                    <li key={item.key}>
                      {item.name}: {formatNumber(item.value)} ha (
                      {formatPercentage(item.value, data.totalHectares)}%)
                    </li>
                  ))}
                </ul>
              </DashboardChartAlternative>
            </>
          ) : (
            <DashboardEmptyChart label="uso do solo" />
          )}
        </CardContent>
      </Card>
    </section>
  );
}
