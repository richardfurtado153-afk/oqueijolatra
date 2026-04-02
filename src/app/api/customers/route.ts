import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, parseBody } from '@/lib/api'
import { MIN_PASSWORD_LENGTH } from '@/lib/auth'

export async function POST(request: Request) {
  const parsed = await parseBody<{ name: string; email: string; password: string; phone?: string; cpf?: string }>(request)
  if (parsed.error) return parsed.error

  const { name, email, password, phone, cpf } = parsed.data

  if (!name || !email || !password) {
    return apiError('Nome, email e senha sao obrigatorios')
  }

  // SECURITY: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return apiError('Email invalido')
  }

  // SECURITY: Limit name length to prevent abuse
  if (name.length > 200) {
    return apiError('Nome muito longo')
  }

  if (password.length < MIN_PASSWORD_LENGTH) {
    return apiError(`Senha deve ter ao menos ${MIN_PASSWORD_LENGTH} caracteres`)
  }

  // SECURITY: Validate CPF if provided (11 digits)
  if (cpf) {
    const cpfClean = cpf.replace(/\D/g, '')
    if (cpfClean.length !== 11) {
      return apiError('CPF invalido')
    }
  }

  // Normalize email to lowercase
  const normalizedEmail = email.toLowerCase().trim()

  const existing = await prisma.customer.findUnique({ where: { email: normalizedEmail } })
  if (existing) {
    return apiError('Email ja cadastrado', 409)
  }

  const passwordHash = await bcrypt.hash(password, 12)
  const customer = await prisma.customer.create({
    data: { name: name.trim(), email: normalizedEmail, passwordHash, phone, cpf },
  })

  return apiSuccess({ id: customer.id, name: customer.name, email: customer.email }, 201)
}
