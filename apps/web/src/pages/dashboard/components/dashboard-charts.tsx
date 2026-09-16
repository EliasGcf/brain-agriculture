import { Pie, PieChart } from 'recharts';
import type { TooltipValueType } from 'recharts';

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

type BreakdownDetail = { label: string; value: number };

type OtherTooltipProps = React.ComponentProps<typeof ChartTooltipContent> & {
  valueFormatter?: (value: TooltipValueType | undefined) => React.ReactNode;
};

export function DashboardOtherTooltip({ active, payload, valueFormatter, ...tooltipProps }: OtherTooltipProps) {
  if (!active || !payload?.length) return null;

  const item = payload[0];
  const details = (item.payload as { details?: BreakdownDetail[] } | undefined)?.details;

  if (!details?.length) {
    return (
      <ChartTooltipContent
        {...tooltipProps}
        active={active}
        payload={payload}
        valueFormatter={valueFormatter}
      />
    );
  }

  return (
    <div className="grid min-w-40 gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl">
      <div className="font-medium">{item.name}</div>
      <div className="font-mono font-medium text-foreground tabular-nums">
        Total: {valueFormatter?.(item.value) ?? item.value}
      </div>
      <ul className="grid gap-1 border-t pt-1.5 text-muted-foreground">
        {details.map((detail) => (
          <li key={detail.label}>
            {detail.label}: {valueFormatter?.(detail.value) ?? detail.value}
          </li>
        ))}
      </ul>
    </div>
  );
}

function selectTopFive<T>(
  items: T[],
  getLabel: (item: T) => string,
  getValue: (item: T) => number,
  createOther: (value: number, details: BreakdownDetail[]) => T & { details: BreakdownDetail[] },
) {
  const remainingItems = items.slice(5);

  return {
    visibleItems: remainingItems.length
      ? [
          ...items.slice(0, 5),
          createOther(
            remainingItems.reduce((total, item) => total + getValue(item), 0),
            remainingItems.map((item) => ({ label: getLabel(item), value: getValue(item) })),
          ),
        ]
      : items,
    remainingItems,
  };
}

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
  const { visibleItems: stateData } = selectTopFive(
    data.hectaresByState,
    (item) => item.state,
    (item) => item.hectares,
    (hectares, details) => ({ state: 'Outros estados', hectares, details }),
  );
  const { visibleItems: cropData } = selectTopFive(
    data.farmsByCrop,
    (item) => item.crop,
    (item) => item.farms,
    (farms, details) => ({ crop: 'Outras culturas', farms, details }),
  );
  const stateTotal = stateData.reduce((sum, item) => sum + item.hectares, 0);
  const stateChartConfig = Object.fromEntries(
    stateData.map((item) => [item.state, { label: item.state }]),
  ) as ChartConfig;
  const cropChartConfig = Object.fromEntries(
    cropData.map((item) => [item.crop, { label: item.crop }]),
  ) as ChartConfig;
  const stateChartData = stateData.map((item, index) => ({
    ...item,
    fill: stateColors[index % stateColors.length],
  }));
  const cropChartData = cropData.map((item, index) => ({
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
          {stateData.length ? (
            <>
              <ChartContainer
                config={stateChartConfig}
                className="h-64 w-full [&_.recharts-pie-label-text]:fill-foreground"
                role="img"
                aria-label="Gráfico de pizza de hectares por estado"
              >
                <PieChart>
                  <ChartTooltip
                    isAnimationActive={false}
                    content={
                      <DashboardOtherTooltip
                        hideLabel
                        nameKey="state"
                        valueFormatter={(value) => `${formatNumber(Number(value))} ha`}
                      />
                    }
                  />
                  <Pie
                    data={stateChartData}
                    dataKey="hectares"
                    isAnimationActive={false}
                    label={({ value }) => formatNumber(Number(value))}
                    nameKey="state"
                    outerRadius={86}
                  >
                  </Pie>
                </PieChart>
              </ChartContainer>
              <DashboardChartAlternative>
                <ul>
                  {stateData.map((item) => (
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
          {cropData.length ? (
            <>
              <ChartContainer
                config={cropChartConfig}
                className="h-64 w-full [&_.recharts-pie-label-text]:fill-foreground"
                role="img"
                aria-label="Gráfico de pizza de fazendas por cultura"
              >
                <PieChart>
                  <ChartTooltip
                    isAnimationActive={false}
                    content={
                      <DashboardOtherTooltip
                        hideLabel
                        nameKey="crop"
                        valueFormatter={(value) => `${formatCount(Number(value))} fazendas`}
                      />
                    }
                  />
                  <Pie
                    data={cropChartData}
                    dataKey="farms"
                    isAnimationActive={false}
                    label={({ value }) => formatCount(Number(value))}
                    nameKey="crop"
                    outerRadius={86}
                  >
                  </Pie>
                </PieChart>
              </ChartContainer>
              <DashboardChartAlternative>
                <ul>
                  {cropData.map((item) => (
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
