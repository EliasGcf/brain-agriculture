import { Plus } from 'lucide-react';
import { toast } from 'sonner';
import { useState } from 'react';

import {
  useCreateFarmMutation,
  useListFarmsByProducerQuery,
  type CreateFarmApiArg,
} from '@store/api/api.generated';
import { Button } from '@components/ui/button';
import { FarmForm } from '@components/farm-form';
import { FarmsTable } from '@components/farms-table';
import { LoadingCard } from '@components/loading-card';
import { RetryCard } from '@components/retry-card';

type ProducerFarmsSectionProps = {
  producerId: string;
};

export function ProducerFarmsSection({ producerId }: ProducerFarmsSectionProps) {
  const [isAddingFarm, setIsAddingFarm] = useState(false);
  const listFarmsQuery = useListFarmsByProducerQuery(
    { producerId },
    { refetchOnMountOrArgChange: true },
  );
  const [createFarm, createFarmState] = useCreateFarmMutation();

  async function handleCreateFarm(body: CreateFarmApiArg['body']) {
    try {
      await createFarm({ body }).unwrap();
      await listFarmsQuery.refetch();
      setIsAddingFarm(false);
    } catch {
      toast.error('Não foi possível cadastrar a fazenda.');
    }
  }

  return (
    <section className="space-y-4">
      <div className="flex flex-row items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Fazendas</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Fazendas vinculadas a este produtor.
          </p>
        </div>
        {!isAddingFarm && (
          <Button onClick={() => setIsAddingFarm(true)}>
            <Plus />
            Adicionar fazenda
          </Button>
        )}
      </div>
      {isAddingFarm && (
        <div className="rounded-lg border bg-muted/20 p-4">
          <FarmForm
            producerId={producerId}
            onSubmit={handleCreateFarm}
            onCancel={() => setIsAddingFarm(false)}
            isLoading={createFarmState.isLoading}
          />
        </div>
      )}
      {listFarmsQuery.isLoading && <LoadingCard label="Carregando fazendas" />}
      {listFarmsQuery.error && (
        <RetryCard
          title="Não foi possível carregar as fazendas."
          description="Tente novamente para recarregar as fazendas deste produtor."
          onRetry={() => listFarmsQuery.refetch()}
        />
      )}
      {!listFarmsQuery.isLoading &&
        !listFarmsQuery.error &&
        (!isAddingFarm || Boolean(listFarmsQuery.data?.length)) && (
          <FarmsTable farms={listFarmsQuery.data ?? []} />
        )}
    </section>
  );
}
