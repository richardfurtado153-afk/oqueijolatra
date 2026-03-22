import { NextRequest, NextResponse } from 'next/server'
import { calculateShipping } from '@/lib/shipping'

export async function POST(request: NextRequest) {
  const { cep, weightGrams } = await request.json()
  if (!cep) return NextResponse.json({ error: 'CEP obrigatorio' }, { status: 400 })
  const options = await calculateShipping(cep, weightGrams || 1000)
  if (options.length === 0) {
    return NextResponse.json(
      { error: 'Nao foi possivel calcular o frete. Entre em contato via WhatsApp.' },
      { status: 422 }
    )
  }
  return NextResponse.json({ options })
}
