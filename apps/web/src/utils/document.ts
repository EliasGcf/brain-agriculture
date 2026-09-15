import { cnpj, cpf } from 'cpf-cnpj-validator'

export function formatDocument(value: string): string {
  const normalized = value.toUpperCase().replace(/[^0-9A-Z]/g, '')
  const isCnpj = normalized.length > 11 || /[A-Z]/.test(normalized)

  if (!isCnpj) {
    const cpfValue = normalized.replace(/\D/g, '').slice(0, 11)
    let formattedCpf = cpfValue.slice(0, 3)
    if (cpfValue.length > 3) formattedCpf += `.${cpfValue.slice(3, 6)}`
    if (cpfValue.length > 6) formattedCpf += `.${cpfValue.slice(6, 9)}`
    if (cpfValue.length > 9) formattedCpf += `-${cpfValue.slice(9, 11)}`
    return formattedCpf
  }

  const cnpjValue = normalized.slice(0, 14)
  let formattedCnpj = cnpjValue.slice(0, 2)
  if (cnpjValue.length > 2) formattedCnpj += `.${cnpjValue.slice(2, 5)}`
  if (cnpjValue.length > 5) formattedCnpj += `.${cnpjValue.slice(5, 8)}`
  if (cnpjValue.length > 8) formattedCnpj += `/${cnpjValue.slice(8, 12)}`
  if (cnpjValue.length > 12) formattedCnpj += `-${cnpjValue.slice(12, 14)}`
  return formattedCnpj
}
export function normalizeDocument(value: string): string {
  return cnpj.strip(value).toLowerCase()
}

export function isValidDocument(value: string): boolean {
  const normalized = normalizeDocument(value)
  return normalized.length === 11
    ? cpf.isValid(normalized)
    : cnpj.isValid(normalized)
}
