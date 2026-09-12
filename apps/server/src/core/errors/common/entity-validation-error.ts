import { UseCaseError } from '../use-case-error'

export class EntityValidationError extends Error implements UseCaseError {
  constructor(cause?: unknown) {
    super('Entity validation failed', { cause })
  }
}
