import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const category = searchParams.get('category')
  const brand = searchParams.get('brand')
  const minPrice = searchParams.get('minPrice')
  const maxPrice = searchParams.get('maxPrice')
  const page = Math.max(1, Number(searchParams.get('page')) || 1)
  const limit = Math.min(50, Math.max(1, Number(searchParams.get('limit')) || 12))
  const featured = searchParams.get('featured')
  const bestseller = searchParams.get('bestseller')
  const isNew = searchParams.get('new')

  const where: Record<string, unknown> = { status: 'AVAILABLE' }

  if (category) where.category = { slug: category }
  if (brand) where.brand = { slug: brand }

  if (minPrice || maxPrice) {
    const priceFilter: Record<string, number> = {}
    if (minPrice) priceFilter.gte = Number(minPrice)
    if (maxPrice) priceFilter.lte = Number(maxPrice)
    where.price = priceFilter
  }

  if (featured === 'true') where.featured = true
  if (bestseller === 'true') where.isBestseller = true
  if (isNew === 'true') where.isNew = true

  const [products, total] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        images: { orderBy: { position: 'asc' } },
        brand: true,
        category: true,
        variations: true,
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.product.count({ where }),
  ])

  return apiSuccess({
    products,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  })
}
