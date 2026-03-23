import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

    const customer = await prisma.customer.findUnique({ where: { email } })
    // Always return success to prevent email enumeration
    if (!customer) return NextResponse.json({ success: true })

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email, expiresAt }
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/conta/redefinir-senha?token=${token}`
    await sendPasswordResetEmail(email, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
