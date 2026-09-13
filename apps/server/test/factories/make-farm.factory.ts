import { faker } from '@faker-js/faker';
import { Area } from '@modules/farms/domain/value-objects/area';
import { Farm } from '@modules/farms/domain/entities/farm';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Injectable } from '@nestjs/common';
import { FarmsRepository } from '@modules/farms/domain/repositories/farms.repository';

type Overrides = {
  producerId?: string;
  totalArea?: Area;
  arableArea?: Area;
  vegetationArea?: Area;
  createdAt?: Date;
  id?: UniqueEntityID;
};

export function makeFarm(data: Overrides = {}) {
  const totalArea = faker.number.int({ min: 100, max: 1_000 });
  const arableArea = faker.number.int({ min: 0, max: totalArea });
  const vegetationArea = faker.number.int({ min: 0, max: totalArea - arableArea });

  return Farm.create(
    {
      name: faker.company.name(),
      producerId: data.producerId ?? faker.string.uuid(),
      city: faker.location.city(),
      state: faker.location.state({ abbreviated: true }),
      totalArea: data.totalArea ?? Area.create(totalArea),
      arableArea: data.arableArea ?? Area.create(arableArea),
      vegetationArea: data.vegetationArea ?? Area.create(vegetationArea),
      createdAt: data.createdAt,
    },
    data.id,
  );
}

@Injectable()
export class FarmFactory {
  constructor(private farmsRepository: FarmsRepository) {}

  async make(data?: Overrides) {
    return this.farmsRepository.save(makeFarm(data));
  }
}
