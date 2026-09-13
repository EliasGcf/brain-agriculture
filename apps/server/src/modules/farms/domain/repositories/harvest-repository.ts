import { Harvest } from '@modules/farms/domain/entities/harvest';

export interface HarvestRepository {
  findById(id: string): Promise<Harvest | null>;
  findManyByFarmId(farmId: string): Promise<Harvest[]>;
  save(harvest: Harvest): Promise<Harvest>;
  deleteById(id: string): Promise<void>;
}
