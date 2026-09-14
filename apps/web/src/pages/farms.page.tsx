import { MapPinned, Plus, Search } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'

export function FarmsPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fazendas</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte e gerencie as fazendas cadastradas.</p>
        </div>
        <Button>
          <Plus />
          Adicionar fazenda
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de fazendas</CardTitle>
          <CardDescription>Busque por fazenda, produtor, cidade ou estado.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Buscar fazenda" aria-label="Buscar fazenda" />
          </div>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <MapPinned className="mx-auto size-8 text-muted-foreground" aria-hidden="true" />
            <p className="mt-3 font-medium">Nenhuma fazenda selecionada</p>
            <p className="mt-1 text-sm text-muted-foreground">As fazendas cadastradas aparecerão nesta lista.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
