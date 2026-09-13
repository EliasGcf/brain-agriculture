import { EntityValidationError } from '@core/errors/common/entity-validation.error';
import { Area } from './area';

describe('Area', () => {
  it('should be able to preserve an area with two decimal places', () => {
    expect(Area.create(12.34).value).toBe(12.34);
  });

  it('should not be able to create an area with a negative value', () => {
    expect(() => Area.create(-1)).toThrow(EntityValidationError);
  });

  it('should not be able to create an area with more than two decimal places', () => {
    expect(() => Area.create(12.345)).toThrow(EntityValidationError);
  });
});
