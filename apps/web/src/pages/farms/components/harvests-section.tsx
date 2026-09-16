import { useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@components/ui/button';
import {
  Table,
  TableBody,
  TableHead,
  TableHeader,
  TableRow,
} from '@components/ui/table';
import { HarvestForm } from './harvest-form';
import { LoadingCard } from '@components/loading-card';
import { RetryCard } from '@components/retry-card';
import { useListHarvestsByFarmQuery } from '@store/api/api.generated';
import type { HarvestFormValue } from '@components/farm-form.types';

type HarvestsSectionProps = {
  farmId: string;
};

function localKey() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function HarvestsSection({ farmId }: HarvestsSectionProps) {
  const harvestsQuery = useListHarvestsByFarmQuery({ farmId });

  if (harvestsQuery.isLoading) {
    return <LoadingCard label="Carregando safras" />;
  }
  if (harvestsQuery.error) {
    return (
      <RetryCard
        title="Não foi possível carregar as safras."
        description="Tente novamente para recarregar as safras e culturas da fazenda."
        onRetry={() => harvestsQuery.refetch()}
      />
    );
  }

  const initialHarvests: HarvestFormValue[] = (harvestsQuery.data ?? []).map(
    (harvest) => ({ id: harvest.id, name: harvest.name, plantedCrops: [] }),
  );

  return <HarvestsSectionContent farmId={farmId} initialHarvests={initialHarvests} />;
}

function HarvestsSectionContent({
  farmId,
  initialHarvests,
}: HarvestsSectionProps & { initialHarvests: HarvestFormValue[] }) {
  const [harvests, setHarvests] = useState<HarvestFormValue[]>(() =>
    initialHarvests.map((harvest) => ({
      ...harvest,
      key: harvest.key ?? harvest.id ?? localKey(),
    })),
  );
  const [expandedKeys, setExpandedKeys] = useState<Set<string>>(() => new Set());

  function updateHarvest(key: string, update: (harvest: HarvestFormValue) => HarvestFormValue) {
    setHarvests((current) =>
      current.map((harvest) => (harvest.key === key ? update(harvest) : harvest)),
    );
  }

  function removeHarvest(key: string) {
    setHarvests((current) => current.filter((harvest) => harvest.key !== key));
    setExpandedKeys((current) => {
      const next = new Set(current);
      next.delete(key);
      return next;
    });
  }

  return (
    <section className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-lg font-semibold">Safras</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Cadastre as safras e as culturas plantadas em cada uma.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => {
            const key = localKey();
            setHarvests((current) => [
              ...current,
              { key, name: '', plantedCrops: [] },
            ]);
            setExpandedKeys((current) => new Set(current).add(key));
          }}
        >
          <Plus />
          Adicionar safra
        </Button>
      </div>

      {harvests.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">Nenhuma safra cadastrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            As safras cadastradas aparecerão nesta lista.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-5"><span className="sr-only">Expandir</span></TableHead>
                <TableHead>Safra</TableHead>
                <TableHead className="w-12"><span className="sr-only">Ações</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {harvests.map((harvest) => {
                const key = harvest.key as string;
                return (
                  <HarvestForm
                    key={key}
                    farmId={farmId}
                    harvest={harvest}
                    expanded={expandedKeys.has(key)}
                    onToggle={() =>
                      setExpandedKeys((current) => {
                        const next = new Set(current);
                        if (next.has(key)) next.delete(key);
                        else next.add(key);
                        return next;
                      })
                    }
                    onSaved={(saved) =>
                      updateHarvest(key, (current) => ({
                        ...current,
                        id: saved.id,
                        name: saved.name,
                      }))
                    }
                    onRemove={() => removeHarvest(key)}
                  />
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </section>
  );
}
