import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError } from '@/lib/api'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return apiError('Busca deve ter pelo menos 2 caracteres')
  }

  const products = await prisma.product.findMany({
    where: {
      status: 'AVAILABLE',
      OR: [
        { name: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        { sku: { contains: q, mode: 'insensitive' } },
      ],
    },
    include: {
      images: { where: { isMain: true }, take: 1 },
      brand: true,
    },
    take: 20,
  })

  return apiSuccess(products)
}
