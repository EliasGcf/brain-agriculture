import { z } from 'zod';
import { cnpj as cnpjTools, cpf as cpfTools } from 'cpf-cnpj-validator';
import { zodValidator } from 'cpf-cnpj-validator/zod';
import { ValueObject } from '@core/entities/value-object';
import { DocumentValidationError } from '@modules/producers/domain/errors/document-validation-error';

const { cpf, cnpj } = zodValidator(z);

const schema = z
  .string()
  .transform((value) => cnpjTools.strip(value).toLowerCase())
  .pipe(z.union([cpf(), cnpj()]));

type Schema = typeof schema;

export class Document extends ValueObject<Schema> {
  static create(value: string) {
    try {
      return new Document(schema.parse(value));
    } catch (error) {
      throw new DocumentValidationError(error);
    }
  }

  static strip(text: string) {
    return cnpjTools.strip(text);
  }

  get value() {
    return this.props;
  }

  get type(): 'cpf' | 'cnpj' {
    const length = this.props.length;
    return length === 11 ? 'cpf' : 'cnpj';
  }

  get formatted(): string {
    if (this.type === 'cpf') return cpfTools.format(this.props);
    return cnpjTools.format(this.props);
  }
}
