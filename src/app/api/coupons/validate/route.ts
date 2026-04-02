import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, parseBody } from '@/lib/api'

export async function POST(request: NextRequest) {
  const parsed = await parseBody<{ code: string; orderValue: number }>(request)
  if (parsed.error) return parsed.error

  const { code, orderValue } = parsed.data
  if (!code) return apiError('Codigo do cupom obrigatorio')

  const coupon = await prisma.coupon.findUnique({ where: { code: code.toUpperCase() } })
  if (!coupon || !coupon.active) {
    return apiError('Cupom invalido', 404)
  }

  const now = new Date()
  if (now < coupon.validFrom || now > coupon.validUntil) {
    return apiError('Cupom expirado', 409)
  }
  if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
    return apiError('Cupom ja utilizado o numero maximo de vezes', 409)
  }
  if (coupon.minOrderValue && orderValue < Number(coupon.minOrderValue)) {
    return apiError(`Valor minimo do pedido: R$ ${coupon.minOrderValue}`)
  }

  const discount =
    coupon.type === 'PERCENT'
      ? (orderValue * (coupon.discountPercent || 0)) / 100
      : Number(coupon.discountValue || 0)

  return apiSuccess({
    code: coupon.code,
    type: coupon.type,
    discount: Math.min(discount, orderValue),
  })
}
