import { ResourceNotFoundError } from './resource-not-found.error';

describe('ResourceNotFoundError', () => {
  it('should be able to keep the default message', () => {
    expect(new ResourceNotFoundError().message).toBe('Resource not found');
  });

  it('should be able to keep a custom message', () => {
    expect(new ResourceNotFoundError('Custom').message).toBe('Custom');
  });
});
