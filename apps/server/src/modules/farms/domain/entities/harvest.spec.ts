import { EntityValidationError } from '@core/errors/common/entity-validation-error';
import { Harvest } from './harvest';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { makeHarvest } from '@test/factories/make-harvest.factory';

describe('Harvest', () => {
  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('harvest-1');
    expect(Harvest.create({ name: '2026', farmId: 'farm-1' }, id).id).toBe(id);
  });

  it('should be able to update a harvest while preserving its identity', () => {
    const harvest = makeHarvest({ farmId: 'farm-1' });
    const createdAt = harvest.createdAt;

    harvest.update({ name: 'Harvest updated' });

    expect(harvest.name).toBe('Harvest updated');
    expect(harvest.farmId).toBe('farm-1');
    expect(harvest.createdAt).toBe(createdAt);
  });

  it('should not be able to update a harvest with a blank name', () => {
    const harvest = makeHarvest({ farmId: 'farm-1' });
    expect(() => harvest.update({ name: ' ' })).toThrow(EntityValidationError);
  });
});
