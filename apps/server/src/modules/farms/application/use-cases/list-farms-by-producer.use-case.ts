import { Injectable } from '@nestjs/common';
import { Farm } from '@modules/farms/domain/entities/farm';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';

interface Params {
  producerId: string;
}

@Injectable()
export class ListFarmsByProducerUseCase {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(params: Params): Promise<Farm[]> {
    return this.farmsRepository.findManyByProducerId(params.producerId);
  }
}
