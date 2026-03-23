import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}

export default async function OrdersPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/conta/login')
  }

  const customerId = session.user.id

  const orders = await prisma.order.findMany({
    where: { customerId },
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      orderNumber: true,
      status: true,
      total: true,
      createdAt: true,
    },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-stone-500 mb-4">Voce ainda nao fez nenhum pedido.</p>
          <Link
            href="/"
            className="inline-block bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Explorar produtos
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((order) => {
            const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-stone-100 text-stone-800' }
            return (
              <Link
                key={order.id}
                href={`/conta/pedidos/${order.id}`}
                className="flex items-center justify-between p-4 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all"
              >
                <div>
                  <p className="font-semibold text-stone-900">
                    Pedido #{order.orderNumber}
                  </p>
                  <p className="text-sm text-stone-500">
                    {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
                    {statusInfo.label}
                  </span>
                  <span className="font-semibold text-stone-900">
                    {formatPrice(Number(order.total))}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
