import { UseCaseError } from '@core/errors/use-case-error';

export class DocumentAlreadyUsedError extends Error implements UseCaseError {
  constructor() {
    super('Document already used');
    this.name = 'DocumentAlreadyUsedError';
  }
}
