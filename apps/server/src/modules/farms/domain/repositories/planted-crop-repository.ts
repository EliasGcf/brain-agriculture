import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

export interface PlantedCropRepository {
  findById(id: string): Promise<PlantedCrop | null>;
  save(crop: PlantedCrop): Promise<void>;
  deleteById(id: string): Promise<void>;
}
