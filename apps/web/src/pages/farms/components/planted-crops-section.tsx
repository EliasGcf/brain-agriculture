import { useEffect, useState } from 'react';
import { Plus } from 'lucide-react';

import { Button } from '@components/ui/button';
import {
  Table,
  TableBody,
} from '@components/ui/table';
import { PlantedCropForm } from './planted-crop-form';
import type { PlantedCropFormValue } from '@components/farm-form.types';
import { useListPlantedCropsByHarvestQuery } from '@store/api/api.generated';
import { Spinner } from '@components/ui/spinner';

type PlantedCropsSectionProps = {
  harvestId: string;
};

function localKey() {
  return `local-${Date.now()}-${Math.random().toString(36).slice(2)}`;
}

export function PlantedCropsSection({
  harvestId,
}: PlantedCropsSectionProps) {
  const cropsQuery = useListPlantedCropsByHarvestQuery({ harvestId });
  const [crops, setCrops] = useState<PlantedCropFormValue[]>([]);

  useEffect(() => {
    if (cropsQuery.data) {
      setCrops(
        cropsQuery.data.map((crop) => ({
          id: crop.id,
          key: crop.id,
          name: crop.name,
        })),
      );
    }
  }, [cropsQuery.data]);

  function updateCrop(key: string, update: (crop: PlantedCropFormValue) => PlantedCropFormValue) {
    setCrops((current) =>
      current.map((crop) => (crop.key === key ? update(crop) : crop)),
    );
  }

  function removeCrop(key: string) {
    setCrops((current) => current.filter((crop) => crop.key !== key));
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-4">
        <div className="pl-2.5">
          <h3 className="font-medium">Culturas</h3>
          <p className="text-sm text-muted-foreground">
            Cada cultura é salva individualmente.
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() =>
            setCrops((current) => [...current, { key: localKey(), name: '' }])
          }
        >
          <Plus />
          Adicionar cultura
        </Button>
      </div>

      {cropsQuery.isLoading ? (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Spinner /> Carregando culturas...
        </div>
      ) : cropsQuery.error ? (
        <p className="text-sm text-destructive">Não foi possível carregar as culturas.</p>
      ) : crops.length === 0 ? (
        <div className="rounded-lg border border-dashed p-8 text-center">
          <p className="font-medium">Nenhuma cultura cadastrada</p>
          <p className="mt-1 text-sm text-muted-foreground">
            As culturas cadastradas aparecerão nesta lista.
          </p>
        </div>
      ) : (
        <Table>
          <TableBody>
            {crops.map((crop) => (
              <PlantedCropForm
                key={crop.key}
                crop={crop}
                harvestId={harvestId}
                onSaved={(saved) =>
                  updateCrop(crop.key as string, (current) => ({
                    ...current,
                    id: saved.id,
                    name: saved.name,
                  }))
                }
                onRemove={() => removeCrop(crop.key as string)}
              />
            ))}
          </TableBody>
        </Table>
      )}
    </div>
  );
}
