import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { prisma } from '@/lib/prisma'

export async function POST(request: Request) {
  const body = await request.json()
  const { name, email, password, phone, cpf } = body

  if (!name || !email || !password) {
    return NextResponse.json({ error: 'Nome, email e senha sao obrigatorios' }, { status: 400 })
  }

  const existing = await prisma.customer.findUnique({ where: { email } })
  if (existing) {
    return NextResponse.json({ error: 'Email ja cadastrado' }, { status: 409 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  const customer = await prisma.customer.create({
    data: { name, email, passwordHash, phone, cpf },
  })

  return NextResponse.json({ id: customer.id, name: customer.name, email: customer.email }, { status: 201 })
}
