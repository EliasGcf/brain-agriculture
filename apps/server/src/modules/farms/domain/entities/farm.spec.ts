import { EntityValidationError } from '@core/errors/common/entity-validation-error';
import { Area } from '@modules/farms/domain/value-objects/area';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { Farm } from './farm';

const valid = {
  name: 'Fazenda Sol',
  producerId: 'producer-1',
  city: 'Goiânia',
  state: 'GO',
  totalArea: Area.create(100),
  arableArea: Area.create(60),
  vegetationArea: Area.create(30),
};

describe('Farm', () => {
  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('farm-1');
    expect(Farm.create(valid, id).id).toBe(id);
  });

  it('should not be able to create a farm with a non-positive total area', () => {
    expect(() => Farm.create({ ...valid, totalArea: Area.create(0) })).toThrow(
      EntityValidationError,
    );
  });

  it('should not be able to create a farm when allocated areas exceed the total area', () => {
    expect(() =>
      Farm.create({
        ...valid,
        arableArea: Area.create(80),
        vegetationArea: Area.create(30),
      }),
    ).toThrow(EntityValidationError);
  });
});
