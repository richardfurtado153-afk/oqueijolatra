import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const { token, password } = await request.json()
    if (!token || !password) {
      return NextResponse.json({ error: 'Token e senha são obrigatórios' }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: 'Senha deve ter ao menos 8 caracteres' }, { status: 400 })
    }

    const resetToken = await prisma.passwordResetToken.findUnique({ where: { token } })
    if (!resetToken || resetToken.used || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
    }

    const passwordHash = await bcrypt.hash(password, 10)
    await prisma.$transaction([
      prisma.customer.update({
        where: { email: resetToken.email },
        data: { passwordHash }
      }),
      prisma.passwordResetToken.update({
        where: { token },
        data: { used: true }
      })
    ])

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Reset password error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
