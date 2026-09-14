import { Plus, Search } from 'lucide-react'

import { Button } from '@components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@components/ui/card'
import { Input } from '@components/ui/input'

export function ProducersPage() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtores</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte e gerencie os produtores cadastrados.</p>
        </div>
        <Button>
          <Plus />
          Adicionar produtor
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de produtores</CardTitle>
          <CardDescription>Busque por nome ou CPF/CNPJ.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative max-w-md">
            <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden="true" />
            <Input className="pl-9" placeholder="Buscar produtor" aria-label="Buscar produtor" />
          </div>
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Nenhum produtor selecionado</p>
            <p className="mt-1 text-sm text-muted-foreground">Os produtores cadastrados aparecerão nesta lista.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
