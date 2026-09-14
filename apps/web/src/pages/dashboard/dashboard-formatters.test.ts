import { formatCount, formatNumber, formatPercentage } from './dashboard-formatters'

describe('dashboard formatters', () => {
  it('should be able to format hectares with Brazilian decimal notation', () => {
    expect(formatNumber(1248.5)).toBe('1.248,50')
  })

  it('should be able to format integer counts without decimal places', () => {
    expect(formatCount(12)).toBe('12')
  })

  it('should be able to calculate a rounded percentage', () => {
    expect(formatPercentage(775.5, 1248.5)).toBe(62)
  })

  it('should be able to return zero percentage when the total is zero', () => {
    expect(formatPercentage(10, 0)).toBe(0)
  })
})
