import { describe, it, expect, vi } from 'vitest'
import { calculateShipping } from '../shipping'

// Mock the correios-brasil module so it always throws, triggering fallback
vi.mock('correios-brasil', () => ({
  calcularPrecoPrazo: vi.fn().mockRejectedValue(new Error('API unavailable')),
}))

describe('calculateShipping', () => {
  it('returns fallback shipping options when API fails', async () => {
    const options = await calculateShipping('01001000', 500)
    expect(options).toHaveLength(2)
    expect(options).toEqual([
      { method: 'PAC', price: 24.9, days: 8 },
      { method: 'SEDEX', price: 42.9, days: 3 },
    ])
  })

  it('fallback contains PAC and SEDEX methods', async () => {
    const options = await calculateShipping('99999999', 1000)
    const methods = options.map((o: any) => o.method)
    expect(methods).toContain('PAC')
    expect(methods).toContain('SEDEX')
  })

  it('fallback PAC is cheaper than SEDEX', async () => {
    const options = await calculateShipping('01001000', 500)
    const pac = options.find((o: any) => o.method === 'PAC')
    const sedex = options.find((o: any) => o.method === 'SEDEX')
    expect(pac!.price).toBeLessThan(sedex!.price)
  })

  it('fallback PAC takes longer than SEDEX', async () => {
    const options = await calculateShipping('01001000', 500)
    const pac = options.find((o: any) => o.method === 'PAC')
    const sedex = options.find((o: any) => o.method === 'SEDEX')
    expect(pac!.days).toBeGreaterThan(sedex!.days)
  })
})
