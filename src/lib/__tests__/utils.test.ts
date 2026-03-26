import { describe, it, expect } from 'vitest'
import { formatPrice, calcDiscountPercent, generateCouponCode } from '../utils'

describe('formatPrice', () => {
  it('formats zero correctly', () => {
    const result = formatPrice(0)
    expect(result).toMatch(/R\$\s*0,00/)
  })

  it('formats integer prices', () => {
    const result = formatPrice(10)
    expect(result).toMatch(/R\$\s*10,00/)
  })

  it('formats decimal prices', () => {
    const result = formatPrice(29.9)
    expect(result).toMatch(/R\$\s*29,90/)
  })

  it('formats large numbers with thousand separators', () => {
    const result = formatPrice(1500)
    expect(result).toMatch(/R\$\s*1\.500,00/)
  })

  it('accepts string input', () => {
    const result = formatPrice('49.99')
    expect(result).toMatch(/R\$\s*49,99/)
  })
})

describe('calcDiscountPercent', () => {
  it('returns 0 when original is 0', () => {
    expect(calcDiscountPercent(0, 10)).toBe(0)
  })

  it('returns 0 when original is negative', () => {
    expect(calcDiscountPercent(-5, 10)).toBe(0)
  })

  it('calculates correct discount percent', () => {
    expect(calcDiscountPercent(100, 80)).toBe(20)
  })

  it('calculates 50% discount', () => {
    expect(calcDiscountPercent(200, 100)).toBe(50)
  })

  it('returns 100 when current is 0', () => {
    expect(calcDiscountPercent(50, 0)).toBe(100)
  })

  it('rounds the result', () => {
    expect(calcDiscountPercent(100, 67)).toBe(33)
  })
})

describe('generateCouponCode', () => {
  it('generates a code with default prefix', () => {
    const code = generateCouponCode()
    expect(code).toMatch(/^NEWS-[A-Z0-9]{6}$/)
  })

  it('generates a code with custom prefix', () => {
    const code = generateCouponCode('VIP')
    expect(code).toMatch(/^VIP-[A-Z0-9]{6}$/)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateCouponCode()))
    // With 36^6 possibilities, 20 codes should all be unique
    expect(codes.size).toBe(20)
  })
})
