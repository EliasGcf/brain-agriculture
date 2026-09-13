import { AppError } from '@core/errors/app.error';

export class DocumentAlreadyUsedError extends AppError {
  constructor() {
    super('Document already used');
    this.name = 'DocumentAlreadyUsedError';
  }
}
