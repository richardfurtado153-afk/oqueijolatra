import { prisma } from '@/lib/prisma'
import { apiSuccess, requireAuth } from '@/lib/api'

export async function GET() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const orders = await prisma.order.findMany({
    where: { customerId: auth.customerId },
    include: { items: true },
    orderBy: { createdAt: 'desc' },
  })

  return apiSuccess(orders)
}
