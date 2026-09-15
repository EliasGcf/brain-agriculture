import { Plus, Search } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useLocation, useNavigate } from 'react-router'

import { Button } from '@components/ui/button'
import { Input } from '@components/ui/input'

import { ProducersList } from './components/producers-list'
import { ProducerEdit } from './components/producer-edit'
import { ProducerForm } from './components/producer-form'
import { producerFixtures, type Producer, type FarmSummary } from './producer-fixtures'

const PAGE_SIZE = 4

export function ProducersPage() {
  const location = useLocation()
  const navigate = useNavigate()
  const [producers, setProducers] = useState<Producer[]>(producerFixtures)
  const [query, setQuery] = useState('')
  const [page, setPage] = useState(1)

  const filteredProducers = useMemo(() => {
    const normalizedQuery = query.trim().toLocaleLowerCase('pt-BR')
    if (!normalizedQuery) return producers

    return producers.filter((producer) =>
      [producer.name, producer.document].some((value) =>
        value.toLocaleLowerCase('pt-BR').includes(normalizedQuery),
      ),
    )
  }, [producers, query])

  const pageCount = Math.max(1, Math.ceil(filteredProducers.length / PAGE_SIZE))
  const visibleProducers = filteredProducers.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE)

  const isCreate = location.pathname === '/produtores/novo'
  const producerId = location.pathname.match(/^\/produtores\/([^/]+)$/)?.[1]
  const selectedProducer = producerId ? producers.find((producer) => producer.id === producerId) : undefined

  function saveProducer(data: { name: string; document: string }) {
    if (isCreate) {
      const id = `producer-${Date.now()}`
      setProducers((current) => [...current, { ...data, id, createdAt: new Date().toISOString().slice(0, 10), farms: [] }])
      navigate(`/produtores/${id}`)
      return
    }
    if (selectedProducer) {
      setProducers((current) => current.map((producer) => producer.id === selectedProducer.id ? { ...producer, ...data } : producer))
    }
  }

  function addFarm(farm: Omit<FarmSummary, 'id'>) {
    if (!selectedProducer) return
    setProducers((current) => current.map((producer) => producer.id === selectedProducer.id ? { ...producer, farms: [...producer.farms, { ...farm, id: `farm-${Date.now()}` }] } : producer))
  }

  function deleteSelectedProducer() {
    if (selectedProducer && selectedProducer.farms.length === 0) {
      setProducers((current) => current.filter((producer) => producer.id !== selectedProducer.id))
      navigate('/produtores')
    }
  }

  if (isCreate || producerId) {
    if (isCreate) {
      return (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-primary">Cadastros</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Novo produtor</h1>
            <p className="mt-1 text-sm text-muted-foreground">Informe os dados básicos do produtor rural.</p>
          </div>
          <ProducerForm existingDocuments={producers.map((producer) => producer.document)} onSubmit={saveProducer} onCancel={() => navigate('/produtores')} />
        </div>
      )
    }
    return <ProducerEdit producer={selectedProducer} existingDocuments={producers.map((producer) => producer.document)} onUpdate={saveProducer} onAddFarm={addFarm} onDelete={deleteSelectedProducer} />
  }

  function handleQueryChange(value: string) {
    setQuery(value)
    setPage(1)
  }

  function handleDelete(producer: Producer) {
    if (producer.farms.length === 0 && window.confirm(`Excluir o produtor ${producer.name}?`)) {
      setProducers((current) => current.filter((item) => item.id !== producer.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-primary">Cadastros</p>
          <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Produtores</h1>
          <p className="mt-1 text-sm text-muted-foreground">Consulte e gerencie os produtores cadastrados.</p>
        </div>
        <Button onClick={() => navigate('/produtores/novo')}>
          <Plus />
          Adicionar produtor
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute top-2.5 left-3 size-4 text-muted-foreground" aria-hidden="true" />
        <Input
          className="pl-9"
          placeholder="Busque por nome ou CPF/CNPJ."
          aria-label="Buscar produtor"
          value={query}
          onChange={(event) => handleQueryChange(event.target.value)}
        />
      </div>
      <ProducersList
        producers={visibleProducers}
        page={page}
        pageCount={pageCount}
        onPageChange={setPage}
        onOpen={(producerId) => navigate(`/produtores/${producerId}`)}
        onDelete={handleDelete}
      />
    </div>
  )
}
