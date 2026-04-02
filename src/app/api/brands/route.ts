import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api'

export async function GET() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return apiSuccess(brands)
}
