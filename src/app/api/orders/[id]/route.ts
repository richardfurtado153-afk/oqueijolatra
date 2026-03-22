import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }
  const customerId = (session.user as { id: string }).id

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  })

  if (!order || order.customerId !== customerId) {
    return NextResponse.json({ error: 'Pedido nao encontrado' }, { status: 404 })
  }

  return NextResponse.json(order)
}
