import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => ({}))
  const email = body?.email
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const customer = await prisma.customer.findUnique({ where: { email } })
  // Always return success to avoid user enumeration
  if (!customer) return NextResponse.json({ ok: true })

  const token = await prisma.passwordResetToken.create({
    data: {
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000),
    }
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/conta/redefinir-senha?token=${token.token}`
  await sendPasswordResetEmail(customer.email, resetUrl).catch(console.error)

  return NextResponse.json({ ok: true })
}
