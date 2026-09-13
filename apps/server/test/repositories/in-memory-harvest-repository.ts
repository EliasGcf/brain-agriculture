import { HarvestRepository } from '@modules/farms/domain/repositories/harvest-repository';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { InMemoryPlantedCropRepository } from './in-memory-planted-crop-repository';

export class InMemoryHarvestRepository implements HarvestRepository {
  public items: Harvest[] = [];

  constructor(private readonly plantedCropRepository: InMemoryPlantedCropRepository) {}

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
    const crops = await this.plantedCropRepository.findManyByHarvestId(id);
    await Promise.all(
      crops.map((crop) => this.plantedCropRepository.deleteById(crop.id.toString())),
    );
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
