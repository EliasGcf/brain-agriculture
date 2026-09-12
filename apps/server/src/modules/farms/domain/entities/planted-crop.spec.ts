import { PlantedCrop } from './planted-crop';
import { UniqueEntityID } from '@core/entities/unique-entity-id';

describe('PlantedCrop', () => {
  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('crop-1');
    const crop = PlantedCrop.create({ name: 'Soja', harvestId: 'harvest-1' }, id);
    expect(crop.id).toBe(id);
  });
});
