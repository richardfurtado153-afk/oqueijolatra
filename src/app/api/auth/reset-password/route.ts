import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token e senha sao obrigatorios' }, { status: 400 })
    }

    // SECURITY: Validate token format (should be 64 hex chars from crypto.randomBytes(32))
    if (typeof token !== 'string' || !/^[a-f0-9]{64}$/.test(token)) {
      return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 400 })
    }

    if (password.length < MIN_PASSWORD_LENGTH) {
      return NextResponse.json({ error: `Senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres` }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token invalido ou expirado' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    await prisma.$transaction([
      prisma.customer.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      }),
      // SECURITY: Mark token as used AND invalidate all other tokens for this email
      prisma.passwordResetToken.updateMany({
        where: { email: resetToken.email, used: false },
        data: { used: true }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
