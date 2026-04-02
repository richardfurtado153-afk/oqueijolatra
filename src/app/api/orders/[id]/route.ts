import { prisma } from '@/lib/prisma'
import { apiSuccess, apiError, requireAuth } from '@/lib/api'

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const { id } = await params

  const order = await prisma.order.findUnique({
    where: { id },
    include: { items: true },
  })

  if (!order || order.customerId !== auth.customerId) {
    return apiError('Pedido nao encontrado', 404)
  }

  return apiSuccess(order)
}
