import { z } from 'zod'
import { cnpj as cnpjTools, cpf as cpfTools } from 'cpf-cnpj-validator'
import { zodValidator } from 'cpf-cnpj-validator/zod'
import { ValueObject } from '@core/entities/value-object'
import { DocumentValidationError } from '@modules/producers/domain/errors/document-validation-error'

const { cpf, cnpj } = zodValidator(z)

const schema = z
  .string()
  .transform((value) => cnpjTools.strip(value))
  .pipe(z.union([cpf(), cnpj()]))

type Schema = typeof schema

export class Document extends ValueObject<Schema> {
  static create(value: string): Document {
    try {
      return new Document(schema.parse(value))
    } catch (error) {
      throw new DocumentValidationError(error)
    }
  }

  get value(): string {
    return this.props
  }

  get type(): 'cpf' | 'cnpj' {
    return cpfTools.isValid(this.props) ? 'cpf' : 'cnpj'
  }
}
