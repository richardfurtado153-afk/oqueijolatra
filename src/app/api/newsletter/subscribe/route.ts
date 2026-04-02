import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateCouponCode } from '@/lib/utils'
import { apiSuccess, apiError, parseBody } from '@/lib/api'

export async function POST(request: NextRequest) {
  const parsed = await parseBody<{ email: string }>(request)
  if (parsed.error) return parsed.error

  const { email: rawEmail } = parsed.data
  if (!rawEmail) return apiError('Email obrigatorio')

  // SECURITY: Validate and normalize email
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  const email = rawEmail.toLowerCase().trim()
  if (!emailRegex.test(email)) {
    return apiError('Email invalido')
  }

  const existing = await prisma.newsletterSubscriber.findUnique({ where: { email } })
  if (existing) {
    return apiError('Email ja cadastrado', 409)
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

  return apiSuccess({ discountCode: subscriber.discountCode }, 201)
}
