const numberFormatter = new Intl.NumberFormat('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

export function formatNumber(value: number) {
  return numberFormatter.format(value)
}

export function formatCount(value: number) {
  return new Intl.NumberFormat('pt-BR').format(value)
}

export function formatPercentage(value: number, total: number) {
  if (!total) return 0
  return Math.round((value / total) * 100)
}
