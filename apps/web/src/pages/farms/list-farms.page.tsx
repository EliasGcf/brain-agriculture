import { Plus, Search } from 'lucide-react'
import { useEffect, useState, type SubmitEvent } from 'react'
import { useNavigate } from 'react-router'
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs'

import { useListFarmsQuery } from '@store/api/api.generated'
import { Button } from '@components/ui/button'
import { ProducerAsyncSelect } from '@components/producer-async-select'
import { StateSelect } from '@components/state-select'
import { Input } from '@components/ui/input'
import { Label } from '@components/ui/label'
import { Spinner } from '@components/ui/spinner'
import { LoadingCard } from '@components/loading-card'
import { RetryCard } from '@components/retry-card'
import { FarmsTable } from '@components/farms-table'

export const PAGE_SIZE = 10

export function FarmsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useQueryStates(
    {
      name: parseAsString.withDefault(''),
      city: parseAsString.withDefault(''),
      state: parseAsString.withDefault(''),
      producerId: parseAsString,
      page: parseAsInteger.withDefault(1),
    },
    { history: 'push' },
  )
  const [producerId, setProducerId] = useState(searchParams.producerId)
  const [state, setState] = useState(searchParams.state)

  useEffect(() => {
    setProducerId(searchParams.producerId)
  }, [searchParams.producerId])

  useEffect(() => {
    setState(searchParams.state)
  }, [searchParams.state])

  const farmsQuery = useListFarmsQuery(
    {
      name: searchParams.name,
      city: searchParams.city,
      state: searchParams.state,
      producerId: searchParams.producerId ?? undefined,
      page: searchParams.page,
      perPage: PAGE_SIZE,
    },
    { refetchOnMountOrArgChange: true },
  )
  const farms = farmsQuery.data?.items ?? []
  const total = farmsQuery.data?.total ?? 0
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE))

  useEffect(() => {
    if (farmsQuery.data && searchParams.page > pageCount) {
      setSearchParams({ page: pageCount })
    }
  }, [farmsQuery.data, pageCount, searchParams.page, setSearchParams])

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault()
    const formData = new FormData(event.currentTarget)
    setSearchParams({
      name: String(formData.get('name') ?? '').trim() || null,
      city: String(formData.get('city') ?? '').trim() || null,
      state: state || null,
      producerId: producerId || null,
      page: 1,
    })
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Cadastros</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">Fazendas</h1>
          </div>
          <Button className="shrink-0" onClick={() => navigate('/farms/new')}>
            <Plus />
            Adicionar fazenda
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">Consulte e gerencie as fazendas cadastradas.</p>
      </div>

      <form
        aria-label="Buscar fazendas"
        className="flex max-w-5xl flex-col gap-4 sm:flex-row sm:items-end"
        onSubmit={handleSearchSubmit}
      >
        <div className="grid flex-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-[1.15fr_1.15fr_0.85fr_1.15fr]">
          <div className="flex flex-col gap-2">
            <Label htmlFor="farm-name">Nome da fazenda</Label>
            <Input id="farm-name" name="name" placeholder="Digite o nome" defaultValue={searchParams.name} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="farm-producer">Produtor</Label>
            <ProducerAsyncSelect
              value={producerId}
              onValueChange={setProducerId}
            />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="farm-state">Estado</Label>
            <StateSelect value={state} onValueChange={setState} />
          </div>
          <div className="flex flex-col gap-2">
            <Label htmlFor="farm-city">Cidade</Label>
            <Input id="farm-city" name="city" placeholder="Digite a cidade" defaultValue={searchParams.city} />
          </div>
        </div>
        <Button type="submit">
          {farmsQuery.isFetching ? <Spinner /> : <Search />}
          Buscar
        </Button>
      </form>

      {farmsQuery.isLoading ? (
        <div className="flex min-h-48 items-center justify-center"><LoadingCard label="Carregando fazendas" /></div>
      ) : farmsQuery.error ? (
        <RetryCard
          title="Não foi possível carregar as fazendas."
          description="Tente novamente para recarregar a listagem."
          onRetry={() => farmsQuery.refetch()}
        />
      ) : (
        <FarmsTable
          farms={farms}
          page={searchParams.page}
          pageCount={pageCount}
          isFetching={farmsQuery.isFetching}
          onPageChange={(page) => setSearchParams({ page })}
        />
      )}
    </div>
  )
}
