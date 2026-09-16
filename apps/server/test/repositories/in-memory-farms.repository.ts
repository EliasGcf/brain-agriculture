import {
  FarmsRepository,
  FindManyFarmsParams,
} from '@modules/farms/domain/repositories/farms.repository';
import { PaginatedResult } from '@core/dto/paginated-result';
import { Farm } from '@modules/farms/domain/entities/farm';
import { Producer } from '@modules/producers/domain/entities/producer';
import { ListFarmsDto } from '@modules/farms/application/dto/list-farms.dto';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';

export class InMemoryFarmsRepository implements FarmsRepository {
  public items: Farm[] = [];
  private producersRepository?: { items: Producer[] };

  constructor(private readonly harvestsRepository: InMemoryHarvestsRepository) {}

  setProducersRepository(producersRepository: { items: Producer[] }) {
    this.producersRepository = producersRepository;
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
