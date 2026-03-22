import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

async function getCustomerId(): Promise<string | null> {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  return (session.user as { id: string }).id
}

export async function GET() {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const favorites = await prisma.favorite.findMany({
    where: { customerId },
    include: {
      product: {
        include: {
          images: { where: { isMain: true }, take: 1 },
          brand: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })

  return NextResponse.json(favorites)
}

export async function POST(request: Request) {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: 'productId obrigatorio' }, { status: 400 })
  }

  const existing = await prisma.favorite.findUnique({
    where: { customerId_productId: { customerId, productId } },
  })

  if (existing) {
    return NextResponse.json({ error: 'Produto ja esta nos favoritos' }, { status: 409 })
  }

  const favorite = await prisma.favorite.create({
    data: { customerId, productId },
  })

  return NextResponse.json(favorite, { status: 201 })
}

export async function DELETE(request: Request) {
  const customerId = await getCustomerId()
  if (!customerId) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }

  const { productId } = await request.json()
  if (!productId) {
    return NextResponse.json({ error: 'productId obrigatorio' }, { status: 400 })
  }

  await prisma.favorite.deleteMany({
    where: { customerId, productId },
  })

  return NextResponse.json({ success: true })
}
