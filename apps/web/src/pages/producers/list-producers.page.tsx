import { Plus, Search } from 'lucide-react';
import { useEffect, type SubmitEvent } from 'react';
import { useNavigate } from 'react-router';
import { parseAsInteger, parseAsString, useQueryStates } from 'nuqs';

import { useListProducersQuery } from '@store/api.generated';
import { Button } from '@components/ui/button';
import { Input } from '@components/ui/input';
import { Label } from '@components/ui/label';
import { Spinner } from '@components/ui/spinner';
import { LoadingCard } from '@components/loading-card';
import { RetryCard } from '@components/retry-card';

import { ProducersTable } from './components/producers-table';

const PAGE_SIZE = 10;

export function ListProducersPage() {
  const navigate = useNavigate();

  const [searchParams, setSearchParams] = useQueryStates(
    {
      name: parseAsString.withDefault(''),
      document: parseAsString.withDefault(''),
      page: parseAsInteger.withDefault(1),
    },
    { history: 'push' },
  );

  const listProducersQuery = useListProducersQuery(
    {
      document: searchParams.document,
      name: searchParams.name,
      page: searchParams.page,
      perPage: PAGE_SIZE,
    },
    { refetchOnMountOrArgChange: true },
  );

  const producers = listProducersQuery.data?.items ?? [];
  const total = listProducersQuery.data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  useEffect(() => {
    if (listProducersQuery.data && searchParams.page > pageCount) {
      setSearchParams({ page: pageCount })
    }
  }, [listProducersQuery.data, searchParams.page, pageCount, setSearchParams]);

  function handleSearchSubmit(event: SubmitEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    setSearchParams({
      name: String(formData.get('name') ?? '').trim() || null,
      document: String(formData.get('document') ?? '').trim() || null,
      page: 1,
    });
  }

  function handlePageChange(nextPage: number) {
    setSearchParams({ page: nextPage });
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-1">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm font-medium text-primary">Cadastros</p>
            <h1 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Produtores
            </h1>
          </div>
          <Button
            className="shrink-0"
            onClick={() => navigate('/producers/new')}
          >
            <Plus />
            Adicionar produtor
          </Button>
        </div>
        <p className="text-sm text-muted-foreground">
          Consulte e gerencie os produtores cadastrados.
        </p>
      </div>

      <form
        aria-label="Buscar produtores"
        className="flex max-w-3xl flex-col gap-4 sm:flex-row sm:items-end"
        key={`${searchParams.name}:${searchParams.document}`}
        onSubmit={handleSearchSubmit}
      >
        <div className="grid flex-1 gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="producer-name">Nome do produtor</Label>
            <Input
              id="producer-name"
              name="name"
              placeholder="Digite o nome"
              defaultValue={searchParams.name}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="producer-document">CPF ou CNPJ</Label>
            <Input
              id="producer-document"
              name="document"
              placeholder="Digite o CPF ou CNPJ"
              defaultValue={searchParams.document}
            />
          </div>
        </div>
        <Button type="submit">
          {listProducersQuery.isFetching ? <Spinner /> : <Search />}
          Buscar
        </Button>
      </form>

      {listProducersQuery.isLoading ? (
        <div className="flex min-h-48 items-center justify-center">
          <LoadingCard label="Carregando produtores" />
        </div>
      ) : listProducersQuery.error ? (
        <RetryCard
          title="Não foi possível carregar os produtores."
          description="Tente novamente para recarregar a listagem."
          onRetry={() => listProducersQuery.refetch()}
        />
      ) : (
        <ProducersTable
          producers={producers}
          page={searchParams.page}
          pageCount={pageCount}
          isFetching={listProducersQuery.isFetching}
          onPageChange={handlePageChange}
          onOpen={(producerId) => navigate(`/producers/${producerId}`)}
          onDeleteSuccess={async () => {
            await listProducersQuery.refetch();
          }}
        />
      )}
    </div>
  );
}
