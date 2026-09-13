import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

export interface PlantedCropRepository {
  findById(id: string): Promise<PlantedCrop | null>;
  findManyByHarvestId(harvestId: string): Promise<PlantedCrop[]>;
  save(crop: PlantedCrop): Promise<PlantedCrop>;
  deleteById(id: string): Promise<void>;
}
