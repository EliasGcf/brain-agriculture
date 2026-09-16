import { BaseExceptionFilter } from '@nestjs/core';
import { EntityValidationError } from '@core/errors/common/entity-validation.error';
import { NotAllowedError } from '@core/errors/common/not-allowed.error';
import { ResourceNotFoundError } from '@core/errors/common/resource-not-found.error';
import { AppError } from '@core/errors/app.error';
import { DocumentAlreadyUsedError } from '@modules/producers/application/errors/document-already-used-error';
import { DocumentValidationError } from '@modules/producers/domain/errors/document-validation-error';
import { InvalidCredentialsError } from '@modules/auth/application/errors/invalid-credentials.error';
import {
  Catch,
  ArgumentsHost,
  InternalServerErrorException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
  UnauthorizedException,
  NotFoundException,
} from '@nestjs/common';

@Catch()
export class GlobalErrorHandling extends BaseExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const isUseCaseError = exception instanceof AppError;

    if (isUseCaseError && host.getType() === 'http') {
      switch (exception.constructor) {
        case DocumentValidationError:
        case EntityValidationError:
          throw new BadRequestException(exception.message);
        case NotAllowedError:
          throw new ForbiddenException(exception.message);
        case ResourceNotFoundError:
          throw new NotFoundException(exception.message);
        case DocumentAlreadyUsedError:
          throw new ConflictException(exception.message);
        case InvalidCredentialsError:
          throw new UnauthorizedException();
        default:
          throw new InternalServerErrorException();
      }
    }

    super.catch(exception, host);
  }
}
