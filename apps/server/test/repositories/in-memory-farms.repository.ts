import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { Farm } from '@modules/farms/domain/entities/farm';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';

function toHundredths(value: number) {
  return Math.round(value * 100);
}

function fromHundredths(value: number) {
  return value / 100;
}

export class InMemoryFarmsRepository implements FarmsRepository {
  public items: Farm[] = [];

  constructor(private readonly harvestsRepository: InMemoryHarvestsRepository) {}

  async getDashboardMetrics() {
    const stateTotals = new Map<string, number>();
    const cropFarms = new Map<string, { label: string; farms: Set<string> }>();
    let totalHectares = 0;
    let arableArea = 0;
    let vegetationArea = 0;

    for (const farm of this.items) {
      totalHectares += toHundredths(farm.totalArea.value);
      arableArea += toHundredths(farm.arableArea.value);
      vegetationArea += toHundredths(farm.vegetationArea.value);
      stateTotals.set(
        farm.state,
        (stateTotals.get(farm.state) ?? 0) + toHundredths(farm.totalArea.value),
      );

      for (const harvest of await this.harvestsRepository.findManyByFarmId(farm.id.toString())) {
        for (const crop of await this.harvestsRepository.plantedCropsRepository.findManyByHarvestId(
          harvest.id.toString(),
        )) {
          const normalizedCrop = crop.name.trim().toLocaleLowerCase();
          const entry = cropFarms.get(normalizedCrop) ?? {
            label: crop.name.trim(),
            farms: new Set<string>(),
          };
          entry.farms.add(farm.id.toString());
          cropFarms.set(normalizedCrop, entry);
        }
      }
    }

    return {
      farmCount: this.items.length,
      totalHectares: fromHundredths(totalHectares),
      hectaresByState: [...stateTotals]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([state, hectares]) => ({ state, hectares: fromHundredths(hectares) })),
      farmsByCrop: [...cropFarms]
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([, entry]) => ({ crop: entry.label, farms: entry.farms.size })),
      landUse: {
        arableArea: fromHundredths(arableArea),
        vegetationArea: fromHundredths(vegetationArea),
        otherUses: fromHundredths(totalHectares - arableArea - vegetationArea),
      },
    };
  }

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findManyByProducerId(producerId: string) {
    return this.items.filter((item) => item.producerId === producerId);
  }

  async save(farm: Farm) {
    const index = this.items.findIndex((item) => item.id.equals(farm.id));
    if (index === -1) this.items.push(farm);
    else this.items[index] = farm;
    return farm;
  }

  async deleteById(id: string) {
    const harvests = await this.harvestsRepository.findManyByFarmId(id);
    await Promise.all(
      harvests.map((harvest) =>
        this.harvestsRepository.deleteById(harvest.id.toString()),
      ),
    );
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
