export function normalizeDocument(value: string) {
  return value.replace(/\D/g, '')
}

function hasValidCheckDigits(value: string) {
  const digits = value.split('').map(Number)
  const firstSum = digits.slice(0, -2).reduce((sum, digit, index) => sum + digit * (digits.length - index - 1), 0)
  const firstCheck = (firstSum * 10) % 11 % 10
  if (firstCheck !== digits[digits.length - 2]) return false

  const secondSum = digits.slice(0, -1).reduce((sum, digit, index) => sum + digit * (digits.length - index), 0)
  const secondCheck = (secondSum * 10) % 11 % 10
  return secondCheck === digits[digits.length - 1]
}

export function isValidDocument(value: string) {
  const document = normalizeDocument(value)
  if (![11, 14].includes(document.length) || /^([0-9])\1+$/.test(document)) return false

  if (document.length === 11) return hasValidCheckDigits(document)

  const digits = document.split('').map(Number)
  const firstWeights = [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const secondWeights = [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2]
  const calculate = (weights: number[]) => {
    const sum = weights.reduce((total, weight, index) => total + digits[index] * weight, 0)
    const remainder = sum % 11
    return remainder < 2 ? 0 : 11 - remainder
  }

  return calculate(firstWeights) === digits[12] && calculate(secondWeights) === digits[13]
}

export function maskDocument(value: string) {
  const document = normalizeDocument(value)
  if (document.length <= 11) {
    return document
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d{1,2})$/, '$1-$2')
  }

  return document
    .replace(/(\d{2})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1.$2')
    .replace(/(\d{3})(\d)/, '$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}
