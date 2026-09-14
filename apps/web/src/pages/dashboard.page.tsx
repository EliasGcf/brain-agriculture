import { AreaChart, MapPinned, Sprout, Wheat } from 'lucide-react'

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@components/ui/card'

const metrics = [
  { label: 'Fazendas cadastradas', value: '24', icon: MapPinned },
  { label: 'Hectares registrados', value: '1.248,50 ha', icon: AreaChart },
  { label: 'Produtores ativos', value: '18', icon: Wheat },
]

export function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-primary">Visão geral</p>
        <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Dashboard agrícola</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Acompanhe a base registrada e a distribuição da operação agrícola.
        </p>
      </div>

      <section aria-label="Resumo da operação" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {metrics.map((metric) => (
          <Card key={metric.label}>
            <CardHeader className="flex-row items-center justify-between space-y-0">
              <CardDescription>{metric.label}</CardDescription>
              <metric.icon className="size-5 text-primary" aria-hidden="true" />
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-semibold">{metric.value}</p>
            </CardContent>
          </Card>
        ))}
      </section>

      <section aria-label="Resumo dos gráficos" className="grid gap-4 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Hectares por estado</CardTitle>
            <CardDescription>Distribuição da área total registrada.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">São Paulo concentra 62% da área cadastrada.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Fazendas por cultura</CardTitle>
            <CardDescription>Quantidade de fazendas com cada cultura.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Soja está presente em 12 fazendas.</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Uso da terra</CardTitle>
            <CardDescription>Área agricultável, vegetação e outros usos.</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">A área agricultável representa 71% do total.</p>
          </CardContent>
        </Card>
      </section>

      <Card>
        <CardContent className="flex items-center gap-3 pt-6">
          <Sprout className="size-5 text-primary" aria-hidden="true" />
          <p className="text-sm text-muted-foreground">
            Use a navegação para consultar produtores e gerenciar suas fazendas.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
