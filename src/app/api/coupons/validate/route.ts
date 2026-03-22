import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const { code, orderValue } = await request.json()
  if (!code) return NextResponse.json({ error: 'Codigo do cupom obrigatorio' }, { status: 400 })

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.active) {
    return NextResponse.json({ error: 'Cupom invalido' }, { status: 404 })
  }

  const now = new Date()
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return NextResponse.json({ error: 'Cupom expirado' }, { status: 409 })
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return NextResponse.json({ error: 'Cupom ja utilizado o numero maximo de vezes' }, { status: 409 })
  }
  if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
    return NextResponse.json(
      { error: `Valor minimo do pedido: R$ ${coupon.minOrderValue}` },
      { status: 400 }
    )
  }

  const discount =
    coupon.type === 'PERCENT'
      ? (orderValue * (coupon.discountPercent || 0)) / 100
      : Number(coupon.discountValue || 0)

  return NextResponse.json({
    code: coupon.code,
    type: coupon.type,
    discount: Math.min(discount, orderValue),
  })
}
