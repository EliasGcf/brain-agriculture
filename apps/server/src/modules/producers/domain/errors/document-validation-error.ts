import { AppError } from '@core/errors/app.error';

export class DocumentValidationError extends AppError {
  constructor(cause?: unknown) {
    super('Document is invalid', { cause });
    this.name = 'DocumentValidationError';
  }
}
