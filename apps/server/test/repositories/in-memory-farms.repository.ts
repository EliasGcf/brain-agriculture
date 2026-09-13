import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { Farm } from '@modules/farms/domain/entities/farm';
import { InMemoryHarvestsRepository } from './in-memory-harvests.repository';

export class InMemoryFarmsRepository implements FarmsRepository {
  public items: Farm[] = [];

  constructor(private readonly harvestsRepository: InMemoryHarvestsRepository) {}

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null;
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
