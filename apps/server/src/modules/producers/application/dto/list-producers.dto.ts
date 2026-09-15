import { Producer } from '@modules/producers/domain/entities/producer';

export interface ListProducersDto {
  producer: Producer;
  farmsCount: number;
}
