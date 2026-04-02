import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import { ORDER_STATUS_LABELS } from '@/types'

export const metadata: Metadata = {
  title: 'Meus Pedidos',
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
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
          </svg>
          <p className="text-lg font-medium text-stone-600 mb-1">Nenhum pedido ainda</p>
          <p className="text-sm text-stone-400 mb-4">Quando voce fizer um pedido, ele aparecera aqui.</p>
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
            const statusInfo = ORDER_STATUS_LABELS[order.status] || { label: order.status, color: 'bg-stone-100 text-stone-800' }
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
