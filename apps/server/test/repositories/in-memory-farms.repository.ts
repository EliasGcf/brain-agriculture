import {
  FarmsRepository,
  FindManyFarmsParams,
} from '@modules/farms/domain/repositories/farms.repository';
import { PaginatedResult } from '@core/dto/paginated-result';
import { Farm } from '@modules/farms/domain/entities/farm';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ListFarmsDto } from '@modules/farms/application/dto/list-farms.dto';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';

function toHundredths(value: number) {
  return Math.round(value * 100);
}

function fromHundredths(value: number) {
  return value / 100;
}

export class InMemoryFarmsRepository implements FarmsRepository {
  public items: Farm[] = [];
  private producersRepository?: { items: Producer[] };

  constructor(private readonly harvestsRepository: InMemoryHarvestsRepository) {}

  setProducersRepository(producersRepository: { items: Producer[] }) {
    this.producersRepository = producersRepository;
  }

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
        .map(([state, hectares]) => ({ state, hectares: fromHundredths(hectares) }))
        .sort((first, second) => second.hectares - first.hectares || first.state.localeCompare(second.state)),
      farmsByCrop: [...cropFarms]
        .map(([, entry]) => ({ crop: entry.label, farms: entry.farms.size }))
        .sort((first, second) => second.farms - first.farms || first.crop.localeCompare(second.crop)),
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

  async findMany(params: FindManyFarmsParams): Promise<PaginatedResult<ListFarmsDto>> {
    const filtered = this.items.filter((farm) => {
      const matches = (value: string, search?: string) =>
        !search || value.toLocaleLowerCase().includes(search.toLocaleLowerCase());

      return (
        matches(farm.name, params.name) &&
        matches(farm.producerId, params.producerId) &&
        matches(farm.city, params.city) &&
        matches(farm.state, params.state)
      );
    });
    const offset = (params.page - 1) * params.perPage;
    const pageItems = filtered.slice(offset, offset + params.perPage);
    const items = pageItems.map((farm) => {
      const owner = this.producersRepository?.items.find(
        (producer) => producer.id.toString() === farm.producerId,
      );

      if (!owner) {
        throw new Error(`Producer ${farm.producerId} not found`);
      }

      return { farm, owner };
    });

    return {
      items,
      total: filtered.length,
    };
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
