import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const favorites = await prisma.favorite.findMany({
    where: { customerId: auth.customerId },
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

  return apiSuccess(favorites)
}

export async function POST(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const parsed = await parseBody<{ productId: string }>(request)
  if (parsed.error) return parsed.error

  const { productId } = parsed.data
  if (!productId) return apiError('productId obrigatorio')

  const existing = await prisma.favorite.findUnique({
    where: { customerId_productId: { customerId: auth.customerId, productId } },
  })
  if (existing) {
    return apiError('Produto ja esta nos favoritos', 409)
  }

  const favorite = await prisma.favorite.create({
    data: { customerId: auth.customerId, productId },
  })

  return apiSuccess(favorite, 201)
}

export async function DELETE(request: Request) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const parsed = await parseBody<{ productId: string }>(request)
  if (parsed.error) return parsed.error

  const { productId } = parsed.data
  if (!productId) return apiError('productId obrigatorio')

  await prisma.favorite.deleteMany({
    where: { customerId: auth.customerId, productId },
  })

  return apiSuccess({ success: true })
}
