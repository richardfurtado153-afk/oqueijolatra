import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCouponCode } from '@/lib/utils'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json(
      { error: 'Email ja cadastrado', discountCode: existing.discountCode },
      { status: 409 }
    )
  }

  const discountCode = generateCouponCode('NEWS')
  const now = new Date()
  const validUntil = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

  await prisma.coupon.create({
    data: {
      code: discountCode,
      type: 'PERCENT',
      discountPercent: 10,
      usageLimit: 1,
      validFrom: now,
      validUntil,
    },
  })

  const subscriber = await prisma.newsletterSubscriber.create({
    data: { email, discountCode },
  })

  return NextResponse.json({ discountCode: subscriber.discountCode }, { status: 201 })
}
