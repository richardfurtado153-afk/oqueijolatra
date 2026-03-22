import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

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
            include: {
              _count: { select: { products: true } },
            },
          },
        },
      },
    },
  })

  return NextResponse.json(categories)
}
