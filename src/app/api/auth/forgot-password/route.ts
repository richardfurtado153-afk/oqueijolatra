import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordResetEmail } from '@/lib/email'
import crypto from 'crypto'

// SECURITY: Simple in-memory rate limiter for password reset
const resetAttempts = new Map<string, { count: number; resetAt: number }>()
const MAX_RESET_ATTEMPTS = 3
const RESET_WINDOW_MS = 15 * 60 * 1000 // 15 minutes

function checkRateLimit(email: string): boolean {
  const now = Date.now()
  const entry = resetAttempts.get(email)
  if (!entry || now > entry.resetAt) {
    resetAttempts.set(email, { count: 1, resetAt: now + RESET_WINDOW_MS })
    return true
  }
  if (entry.count >= MAX_RESET_ATTEMPTS) return false
  entry.count++
  return true
}

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    if (!email) return NextResponse.json({ error: 'Email obrigatorio' }, { status: 400 })

    // SECURITY: Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json({ error: 'Email invalido' }, { status: 400 })
    }

    const normalizedEmail = email.toLowerCase().trim()

    // SECURITY: Rate limit by email to prevent abuse
    if (!checkRateLimit(normalizedEmail)) {
      // Still return success to prevent enumeration
      return NextResponse.json({ success: true })
    }

    const customer = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
    // Always return success to prevent email enumeration
    if (!customer) return NextResponse.json({ success: true })

    // Clean up previous expired/used tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: {
        email: normalizedEmail,
        OR: [{ used: true }, { expiresAt: { lt: new Date() } }],
      },
    })

    // SECURITY: Also limit active tokens per email (prevent token flooding)
    const activeTokenCount = await prisma.passwordResetToken.count({
      where: { email: normalizedEmail, used: false, expiresAt: { gt: new Date() } },
    })
    if (activeTokenCount >= 3) {
      return NextResponse.json({ success: true })
    }

    const token = crypto.randomBytes(32).toString('hex')
    const expiresAt = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: { token, email: normalizedEmail, expiresAt }
    })

    const baseUrl = process.env.NEXTAUTH_URL ?? 'http://localhost:3000'
    const resetUrl = `${baseUrl}/conta/redefinir-senha?token=${token}`
    await sendPasswordResetEmail(normalizedEmail, resetUrl)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Forgot password error:', err)
    return NextResponse.json({ error: 'Erro interno' }, { status: 500 })
  }
}
