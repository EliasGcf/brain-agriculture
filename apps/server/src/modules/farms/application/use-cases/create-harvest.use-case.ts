import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';
import { HarvestsRepository } from '@modules/farms/domain/repositories/harvests.repository';

interface Params {
  name: string;
  farmId: string;
}

export class CreateHarvestUseCase {
  constructor(
    private readonly harvestsRepository: HarvestsRepository,
    private readonly farmsRepository: FarmsRepository,
  ) {}
  async execute(params: Params) {
    const farm = await this.farmsRepository.findById(params.farmId);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    const harvest = Harvest.create({ name: params.name, farmId: farm.id.toString() });

    await this.harvestsRepository.save(harvest);

    return harvest;
  }
}
