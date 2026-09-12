export class DocumentValidationError extends Error {
  constructor(cause?: unknown) {
    super('Document is invalid', { cause });
    this.name = 'DocumentValidationError';
  }
}
