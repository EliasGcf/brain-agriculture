import { Harvest } from '@modules/farms/domain/entities/harvest';

export abstract class HarvestsRepository {
  abstract findById(id: string): Promise<Harvest | null>;
  abstract findManyByFarmId(farmId: string): Promise<Harvest[]>;
  abstract save(harvest: Harvest): Promise<Harvest>;
  abstract deleteById(id: string): Promise<void>;
}
