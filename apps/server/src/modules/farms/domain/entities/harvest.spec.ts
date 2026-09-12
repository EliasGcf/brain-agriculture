import { Harvest } from './harvest';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

describe('Harvest', () => {
  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('harvest-1');
    expect(Harvest.create({ name: '2026', farmId: 'farm-1' }, id).id).toBe(id);
  });
});
