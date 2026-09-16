import { Injectable } from '@nestjs/common';
import { PaginatedResult } from '@core/dto/paginated-result';
import {
  FarmsRepository,
  FindManyFarmsParams,
} from '@modules/farms/domain/repositories/farms.repository';
import { ListFarmsDto } from "@modules/farms/application/dto/list-farms.dto";

@Injectable()
export class ListFarmsUseCase {
  constructor(private readonly farmsRepository: FarmsRepository) {}

  async execute(params: FindManyFarmsParams): Promise<PaginatedResult<ListFarmsDto>> {
    return this.farmsRepository.findMany(params);
  }
}
