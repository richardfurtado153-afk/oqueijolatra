import { NextRequest } from 'next/server'
import { calculateShipping } from '@/lib/shipping'
import { apiSuccess, apiError, parseBody } from '@/lib/api'

export async function POST(request: NextRequest) {
  const parsed = await parseBody<{ cep: string; weightGrams?: number }>(request)
  if (parsed.error) return parsed.error

  const { cep, weightGrams } = parsed.data
  if (!cep) return apiError('CEP obrigatorio')

  const options = await calculateShipping(cep, weightGrams || 1000)
  if (options.length === 0) {
    return apiError('Nao foi possivel calcular o frete. Entre em contato via WhatsApp.', 422)
  }

  return apiSuccess({ options })
}
