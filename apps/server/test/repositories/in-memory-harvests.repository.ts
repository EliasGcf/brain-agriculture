import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { InMemoryPlantedCropsRepository } from './in-memory-planted-crops.repository';

export class InMemoryHarvestsRepository implements HarvestsRepository {
  public items: Harvest[] = [];

  constructor(public readonly plantedCropsRepository: InMemoryPlantedCropsRepository) {}

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findManyByFarmId(farmId: string) {
    return this.items.filter((item) => item.farmId === farmId);
  }

  async save(harvest: Harvest) {
    const index = this.items.findIndex((item) => item.id.equals(harvest.id));
    if (index === -1) this.items.push(harvest);
    else this.items[index] = harvest;
    return harvest;
  }

  async deleteById(id: string) {
    const crops = await this.plantedCropsRepository.findManyByHarvestId(id);
    await Promise.all(
      crops.map((crop) => this.plantedCropsRepository.deleteById(crop.id.toString())),
    );
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
