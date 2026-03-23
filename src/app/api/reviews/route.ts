import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { name: true } } },
  })

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return NextResponse.json({ reviews, avg, total: reviews.length })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Você precisa estar logado para avaliar' }, { status: 401 })
  }

  const { productId, rating, title, body } = await request.json()
  if (!productId || !rating || !title || !body) {
    return NextResponse.json({ error: 'Todos os campos são obrigatórios' }, { status: 400 })
  }
  if (rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Nota deve ser de 1 a 5' }, { status: 400 })
  }

  // Check if customer purchased this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId: session.user.id, status: { in: ['DELIVERED', 'SHIPPED'] } }
    }
  })

  const existing = await prisma.review.findUnique({
    where: { customerId_productId: { customerId: session.user.id, productId } }
  })
  if (existing) {
    return NextResponse.json({ error: 'Você já avaliou este produto' }, { status: 409 })
  }

  const review = await prisma.review.create({
    data: {
      customerId: session.user.id,
      productId,
      rating,
      title,
      body,
      approved: !!hasPurchased, // auto-approve if verified purchase
    }
  })

  return NextResponse.json({ review, message: hasPurchased ? 'Avaliação publicada!' : 'Avaliação enviada para moderação.' })
}
