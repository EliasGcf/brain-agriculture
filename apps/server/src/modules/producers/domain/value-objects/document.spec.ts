import { DocumentValidationError } from '@modules/producers/domain/errors/document-validation-error'
import { Document } from '@modules/producers/domain/value-objects/document'

describe('Document', () => {
  it('should be able to create a normalized CPF', () => {
    expect(Document.create(' 529.982.247-25 ').value).toBe('52998224725')
  })

  it('should be able to create a normalized CNPJ', () => {
    expect(Document.create('11.222.333/0001-81').value).toBe('11222333000181')
  })

  it('should be able to create a normalized alphanumeric CNPJ', () => {
    const document = Document.create('12.ABC.345/01DE-35')
    expect(document.value).toBe('12ABC34501DE35')
    expect(document.type).toBe('cnpj')
  })

  it('should be able to identify a CPF', () => {
    expect(Document.create('529.982.247-25').type).toBe('cpf')
  })

  it('should be able to identify a CNPJ', () => {
    expect(Document.create('11.222.333/0001-81').type).toBe('cnpj')
  })

  it('should not be able to create an invalid CPF or CNPJ', () => {
    expect(() => Document.create('529.982.247-24')).toThrow(DocumentValidationError)
    expect(() => Document.create('11.222.333/0001-80')).toThrow(DocumentValidationError)
  })

  it('should not be able to create an empty document', () => expect(() => Document.create('')).toThrow(DocumentValidationError))
})
