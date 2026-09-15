import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'

import { Button } from '@components/ui/button'
import { Separator } from '@components/ui/separator'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@components/ui/tooltip'

import type { FarmSummary, Producer } from '../producer-fixtures'
import { maskDocument } from '../producer-validation'
import { ProducerForm } from './producer-form'
import { InlineFarmForm } from './inline-farm-form'

type ProducerDetailProps = {
  producer?: Producer
  existingDocuments: string[]
  onUpdate: (data: { name: string; document: string }) => void
  onAddFarm: (farm: Omit<FarmSummary, 'id'>) => void
  onDelete: () => void
}

function formatArea(value: number) {
  return new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 }).format(value)
}

export function ProducerEdit({ producer, existingDocuments, onUpdate, onAddFarm, onDelete }: ProducerDetailProps) {
  const [isAddingFarm, setIsAddingFarm] = useState(false)
  if (!producer) {
    return (
      <div className="space-y-3">
        <h1 className="text-2xl font-semibold tracking-tight">Produtor não encontrado</h1>
        <p className="text-sm text-muted-foreground">O produtor informado não existe nos dados atuais.</p>
        <a className="text-sm font-medium text-primary underline" href="/produtores">Voltar para produtores</a>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Produtor</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">{producer.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">CPF/CNPJ: {maskDocument(producer.document)}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger render={<span />}>
              <Button variant="destructive" onClick={onDelete} disabled={producer.farms.length > 0}>
                <Trash2 />
                Excluir produtor
              </Button>
            </TooltipTrigger>
            {producer.farms.length > 0 && <TooltipContent>Não é possível excluir um produtor que possui fazendas.</TooltipContent>}
          </Tooltip>
        </TooltipProvider>
      </div>
      </div>
      <ProducerForm producer={producer} existingDocuments={existingDocuments} onSubmit={onUpdate} />
      <Separator />
      <section className="space-y-4">
        <div className="flex flex-row items-start justify-between gap-4">
          <div><h2 className="text-lg font-semibold">Fazendas</h2><p className="mt-1 text-sm text-muted-foreground">Fazendas vinculadas a este produtor.</p></div>
          {!isAddingFarm && <Button onClick={() => setIsAddingFarm(true)}><Plus />Adicionar fazenda</Button>}
        </div>
        {isAddingFarm && <InlineFarmForm onSubmit={(farm) => { onAddFarm(farm); setIsAddingFarm(false) }} onCancel={() => setIsAddingFarm(false)} />}
        {producer.farms.length === 0 && !isAddingFarm ? (
          <div className="rounded-lg border border-dashed p-8 text-center">
            <p className="font-medium">Nenhuma fazenda cadastrada</p>
            <p className="mt-1 text-sm text-muted-foreground">Adicione a primeira fazenda deste produtor.</p>
          </div>
        ) : producer.farms.length > 0 ? (
          <div className="space-y-3">
            {producer.farms.map((farm) => (
              <div key={farm.id} className="rounded-lg border p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div>
                    <p className="font-medium">{farm.name}</p>
                    <p className="text-sm text-muted-foreground">{farm.city}, {farm.state}</p>
                  </div>
                  <Button variant="outline" size="sm">Ver / editar</Button>
                </div>
                <dl className="mt-4 grid grid-cols-3 gap-3 text-sm">
                  <div><dt className="text-muted-foreground">Área total</dt><dd className="font-medium">{formatArea(farm.totalArea)} ha</dd></div>
                  <div><dt className="text-muted-foreground">Agricultável</dt><dd className="font-medium">{formatArea(farm.arableArea)} ha</dd></div>
                  <div><dt className="text-muted-foreground">Vegetação</dt><dd className="font-medium">{formatArea(farm.vegetationArea)} ha</dd></div>
                </dl>
              </div>
            ))}
          </div>
        ) : null}
      </section>
    </div>
  )
}
