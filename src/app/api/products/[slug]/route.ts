import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      brand: true,
      category: { include: { parent: true } },
      variations: true,
    },
  })

  if (!product) {
    return apiError('Produto nao encontrado', 404)
  }

  const related = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      id: { not: product.id },
      status: 'AVAILABLE',
    },
    include: {
      images: { orderBy: { position: 'asc' }, take: 1 },
      brand: true,
    },
    take: 4,
  })

  return apiSuccess({ product, related })
}
