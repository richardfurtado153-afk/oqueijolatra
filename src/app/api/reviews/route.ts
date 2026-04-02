import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api'

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) return apiError('productId required')

  const reviews = await prisma.review.findMany({
    where: { productId, approved: true },
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { name: true } } },
  })

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : null

  return apiSuccess({ reviews, avg, total: reviews.length })
}

interface ReviewBody {
  productId: string
  rating: number
  title: string
  body: string
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const parsed = await parseBody<ReviewBody>(request)
  if (parsed.error) return parsed.error
  const { productId, rating, title, body } = parsed.data

  if (!productId || !rating || !title || !body) {
    return apiError('Todos os campos sao obrigatorios')
  }
  if (rating < 1 || rating > 5) {
    return apiError('Nota deve ser de 1 a 5')
  }

  const existing = await prisma.review.findUnique({
    where: { customerId_productId: { customerId: auth.customerId, productId } }
  })
  if (existing) {
    return apiError('Voce ja avaliou este produto', 409)
  }

  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId: auth.customerId, status: { in: ['DELIVERED', 'SHIPPED'] } }
    }
  })

  const review = await prisma.review.create({
    data: {
      customerId: auth.customerId,
      productId,
      rating,
      title,
      body,
      approved: !!hasPurchased,
    }
  })

  return apiSuccess({
    review,
    message: hasPurchased ? 'Avaliacao publicada!' : 'Avaliacao enviada para moderacao.',
  })
}
