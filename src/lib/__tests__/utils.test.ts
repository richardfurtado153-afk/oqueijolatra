import { describe, it, expect } from 'vitest'
import { formatPrice, calcDiscountPercent, generateCouponCode } from '../utils'

describe('formatPrice', () => {
  it('formats zero correctly', () => {
    const result = formatPrice(0)
    expect(result).toContain('0,00')
  })

  it('formats integer prices', () => {
    const result = formatPrice(10)
    expect(result).toContain('10,00')
  })

  it('formats decimal prices', () => {
    const result = formatPrice(29.9)
    expect(result).toContain('29,90')
  })

  it('formats large numbers with thousands separator', () => {
    const result = formatPrice(1250.5)
    expect(result).toContain('1.250,50')
  })

  it('accepts string input', () => {
    const result = formatPrice('49.99')
    expect(result).toContain('49,99')
  })

  it('includes BRL currency symbol', () => {
    const result = formatPrice(100)
    expect(result).toMatch(/R\$/)
  })
})

describe('calcDiscountPercent', () => {
  it('calculates discount percentage correctly', () => {
    expect(calcDiscountPercent(100, 80)).toBe(20)
  })

  it('returns 0 when original is 0', () => {
    expect(calcDiscountPercent(0, 50)).toBe(0)
  })

  it('returns 0 when original is negative', () => {
    expect(calcDiscountPercent(-10, 5)).toBe(0)
  })

  it('returns 100 for free items', () => {
    expect(calcDiscountPercent(50, 0)).toBe(100)
  })

  it('rounds to nearest integer', () => {
    expect(calcDiscountPercent(3, 1)).toBe(67)
  })

  it('handles same price (no discount)', () => {
    expect(calcDiscountPercent(100, 100)).toBe(0)
  })
})

describe('generateCouponCode', () => {
  it('generates a code with default prefix', () => {
    const code = generateCouponCode()
    expect(code).toMatch(/^NEWS-[A-Z0-9]{6}$/)
  })

  it('generates a code with custom prefix', () => {
    const code = generateCouponCode('SALE')
    expect(code).toMatch(/^SALE-[A-Z0-9]{6}$/)
  })

  it('generates unique codes', () => {
    const codes = new Set(Array.from({ length: 20 }, () => generateCouponCode()))
    expect(codes.size).toBeGreaterThan(1)
  })
})
