import { AppError } from '@core/errors/app.error';

export class InvalidCredentialsError extends AppError {
  constructor() {
    super('Invalid credentials');
    this.name = 'InvalidCredentialsError';
  }
}
