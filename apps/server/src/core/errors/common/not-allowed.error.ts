import { AppError } from '../app.error';

export class NotAllowedError extends AppError {
  constructor() {
    super('Not allowed');
    this.name = 'NotAllowedError';
  }
}
