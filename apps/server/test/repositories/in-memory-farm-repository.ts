import { FarmRepository } from '@modules/farms/domain/repositories/farm-repository';
import { Farm } from '@modules/farms/domain/entities/farm';
import { InMemoryHarvestRepository } from './in-memory-harvest-repository';

export class InMemoryFarmRepository implements FarmRepository {
  public items: Farm[] = [];

  constructor(private readonly harvestRepository: InMemoryHarvestRepository) {}

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
    const harvests = await this.harvestRepository.findManyByFarmId(id);
    await Promise.all(
      harvests.map((harvest) => this.harvestRepository.deleteById(harvest.id.toString())),
    );
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
