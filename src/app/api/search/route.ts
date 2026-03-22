import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const q = request.nextUrl.searchParams.get('q')?.trim() ?? ''

  if (q.length < 2) {
    return NextResponse.json({ error: 'Busca deve ter pelo menos 2 caracteres' }, { status: 400 })
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
      images: {
        where: { isMain: true },
        take: 1,
      },
      brand: true,
    },
    take: 20,
  })

  return NextResponse.json(products)
}
