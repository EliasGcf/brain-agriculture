import { Harvest } from '@modules/farms/domain/entities/harvest';

export interface HarvestRepository {
  findById(id: string): Promise<Harvest | null>;
  save(harvest: Harvest): Promise<void>;
  deleteById(id: string): Promise<void>;
}
