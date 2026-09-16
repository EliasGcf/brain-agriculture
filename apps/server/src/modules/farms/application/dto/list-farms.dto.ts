import { Farm } from "@modules/farms/domain/entities/farm";
import { Producer } from '@modules/producers/domain/entities/producer';

export interface ListFarmsDto {
  farm: Farm;
  owner: Producer;
}
