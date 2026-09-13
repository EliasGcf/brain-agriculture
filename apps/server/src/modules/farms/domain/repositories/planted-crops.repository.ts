import { PlantedCrop } from '@modules/farms/domain/entities/planted-crop';

export abstract class PlantedCropsRepository {
  abstract findById(id: string): Promise<PlantedCrop | null>;
  abstract findManyByHarvestId(harvestId: string): Promise<PlantedCrop[]>;
  abstract save(crop: PlantedCrop): Promise<PlantedCrop>;
  abstract deleteById(id: string): Promise<void>;
}
