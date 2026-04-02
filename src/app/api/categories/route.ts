import { prisma } from '@/lib/prisma'
import { apiSuccess } from '@/lib/api'

export async function GET() {
  const categories = await prisma.category.findMany({
    where: { parentId: null },
    orderBy: { position: 'asc' },
    include: {
      _count: { select: { products: true } },
      children: {
        orderBy: { position: 'asc' },
        include: {
          _count: { select: { products: true } },
          children: {
            orderBy: { position: 'asc' },
            include: { _count: { select: { products: true } } },
          },
        },
      },
    },
  })

  return apiSuccess(categories)
}
