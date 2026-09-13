import { PlantedCropRepository } from '@modules/farms/domain/repositories/planted-crop-repository';
import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

export class InMemoryPlantedCropRepository implements PlantedCropRepository {
  public items: PlantedCrop[] = [];

  async findById(id: string) {
    return this.items.find((item) => item.id.toString() === id) ?? null;
  }

  async findManyByHarvestId(harvestId: string) {
    return this.items.filter((item) => item.harvestId === harvestId);
  }

  async save(crop: PlantedCrop) {
    const index = this.items.findIndex((item) => item.id.equals(crop.id));
    if (index === -1) this.items.push(crop);
    else this.items[index] = crop;
    return crop;
  }

  async deleteById(id: string) {
    this.items = this.items.filter((item) => item.id.toString() !== id);
  }
}
