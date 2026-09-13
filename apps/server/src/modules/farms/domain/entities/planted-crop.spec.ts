import { EntityValidationError } from '@core/errors/common/entity-validation.error';
import { PlantedCrop } from './planted-crop';
import { UniqueEntityID } from '@core/entities/unique-entity-id';
import { makePlantedCrop } from '@test/factories/make-planted-crop.factory';

describe('PlantedCrop', () => {
  it('should be able to preserve a supplied ID', () => {
    const id = new UniqueEntityID('crop-1');
    const crop = PlantedCrop.create({ name: 'Soja', harvestId: 'harvest-1' }, id);
    expect(crop.id).toBe(id);
  });

  it('should be able to update a planted crop while preserving its identity', () => {
    const crop = makePlantedCrop({ harvestId: 'harvest-1' });
    const createdAt = crop.createdAt;

    crop.update({ name: 'Corn' });

    expect(crop.name).toBe('Corn');
    expect(crop.harvestId).toBe('harvest-1');
    expect(crop.createdAt).toBe(createdAt);
  });

  it('should not be able to update a planted crop with a blank name', () => {
    const crop = makePlantedCrop({ harvestId: 'harvest-1' });

    expect(() => crop.update({ name: ' ' })).toThrow(EntityValidationError);
  });
});
