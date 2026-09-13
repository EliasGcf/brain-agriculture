import { ResourceNotFoundError } from '@core/errors/common/resource-not-found-error';
import { Harvest } from '@modules/farms/domain/entities/harvest';
import { FarmRepository } from '@modules/farms/domain/repositories/farm-repository';
import { HarvestRepository } from '@modules/farms/domain/repositories/harvest-repository';

interface Params {
  name: string;
  farmId: string;
}

export class CreateHarvestUseCase {
  constructor(
    private readonly harvestRepository: HarvestRepository,
    private readonly farmRepository: FarmRepository,
  ) {}
  async execute(params: Params) {
    const farm = await this.farmRepository.findById(params.farmId);
    if (!farm) throw new ResourceNotFoundError('Farm not found');

    const harvest = Harvest.create({ name: params.name, farmId: farm.id.toString() });

    await this.harvestRepository.save(harvest);

    return harvest;
  }
}
