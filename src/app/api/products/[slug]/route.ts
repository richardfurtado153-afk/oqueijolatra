import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
      category: {
        include: { parent: true },
      },
      variations: true,
    },
  })

  if (!product) {
    return NextResponse.json({ error: 'Produto nao encontrado' }, { status: 404 })
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

  return NextResponse.json({ product, related })
}
