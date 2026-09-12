import { Farm } from '@modules/farms/domain/entities/farm';

export interface FarmRepository {
  findById(id: string): Promise<Farm | null>;
  save(farm: Farm): Promise<void>;
  deleteById(id: string): Promise<void>;
}
