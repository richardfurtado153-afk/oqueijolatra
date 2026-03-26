import { describe, it, expect, vi } from 'vitest'
import { calculateShipping } from '../shipping'

describe('calculateShipping', () => {
  it('returns fallback shipping when Correios API fails', async () => {
    // The dynamic import of correios-brasil will fail in test env,
    // triggering the fallback
    const options = await calculateShipping('12345678', 500)
    expect(options).toEqual([
      { method: 'PAC', price: 24.9, days: 8 },
      { method: 'SEDEX', price: 42.9, days: 3 },
    ])
  })

  it('returns an array with two shipping methods', async () => {
    const options = await calculateShipping('01001000', 1000)
    expect(options).toHaveLength(2)
    expect(options[0]).toHaveProperty('method')
    expect(options[0]).toHaveProperty('price')
    expect(options[0]).toHaveProperty('days')
  })

  it('includes PAC and SEDEX methods in fallback', async () => {
    const options = await calculateShipping('99999999', 200)
    const methods = options.map((o: any) => o.method)
    expect(methods).toContain('PAC')
    expect(methods).toContain('SEDEX')
  })
})
