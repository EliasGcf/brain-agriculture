import { AppError } from '../app.error';

export class EntityValidationError extends AppError {
  constructor(cause?: unknown) {
    super('Entity validation failed', { cause });
    this.name = 'EntityValidationError';
  }
}
