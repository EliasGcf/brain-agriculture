import { Farm } from '@modules/farms/domain/entities/farm';

export abstract class FarmsRepository {
  abstract findById(id: string): Promise<Farm | null>;
  abstract findManyByProducerId(producerId: string): Promise<Farm[]>;
  abstract save(farm: Farm): Promise<Farm>;
  abstract deleteById(id: string): Promise<void>;
}
