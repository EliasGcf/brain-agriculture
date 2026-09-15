import { describe, expect, it } from 'vitest'

import { formatDocument, isValidDocument, normalizeDocument } from './document'

describe('producer document utility', () => {
  it('should be able to format a partial CPF', () => {
    expect(formatDocument('529982')).toBe('529.982')
    expect(formatDocument('52998224725')).toBe('529.982.247-25')
  })

  it('should be able to format a partial CNPJ', () => {
    expect(formatDocument('112223330001')).toBe('11.222.333/0001')
    expect(formatDocument('11222333000181')).toBe('11.222.333/0001-81')
  })

  it('should be able to validate a CPF', () => {
    expect(isValidDocument('529.982.247-25')).toBe(true)
  })

  it('should be able to validate a CNPJ', () => {
    expect(isValidDocument('11.222.333/0001-81')).toBe(true)
  })

  it('should be able to validate an alphanumeric CNPJ', () => {
    expect(isValidDocument('12.ABC.345/01DE-35')).toBe(true)
  })

  it('should not be able to validate an invalid document', () => {
    expect(isValidDocument('111.111.111-11')).toBe(false)
  })

  it('should be able to normalize document input for requests', () => {
    expect(normalizeDocument(' 11.222.333/0001-81 ')).toBe('11222333000181')
  })

  it('should preserve letters when normalizing an alphanumeric CNPJ', () => {
    expect(normalizeDocument('12.ABC.345/01DE-35')).toBe('12abc34501de35')
  })
})
