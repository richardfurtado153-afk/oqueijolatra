import { getServerSession } from 'next-auth'
import { redirect, notFound } from 'next/navigation'
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

const PAYMENT_LABELS: Record<string, string> = {
  PIX: 'PIX',
  CARD: 'Cartao de Credito',
}

const PAYMENT_STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  CONFIRMED: 'Confirmado',
  FAILED: 'Falhou',
  REFUNDED: 'Reembolsado',
}

interface OrderDetailPageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params

  const session = await getServerSession(authOptions)
  if (!session?.user) {
    redirect('/conta/login')
  }

  const order = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  })

  if (!order || order.customerId !== session.user.id) {
    notFound()
  }

  const statusInfo = STATUS_LABELS[order.status] || { label: order.status, color: 'bg-stone-100 text-stone-800' }

  return (
    <div>
      <Link
        href="/conta/pedidos"
        className="text-sm text-amber-700 hover:underline mb-4 inline-block"
      >
        &larr; Voltar para pedidos
      </Link>

      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Pedido #{order.orderNumber}
        </h1>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusInfo.color}`}>
          {statusInfo.label}
        </span>
      </div>

      <div className="space-y-6">
        {/* Items */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Itens do Pedido</h2>
          <div className="divide-y divide-stone-100">
            {order.items.map((item) => (
              <div key={item.id} className="flex items-center justify-between py-3">
                <div>
                  <p className="font-medium text-stone-900">{item.productName}</p>
                  {item.variationName && (
                    <p className="text-sm text-stone-500">{item.variationName}</p>
                  )}
                  <p className="text-sm text-stone-500">
                    {item.quantity}x {formatPrice(Number(item.unitPrice))}
                  </p>
                </div>
                <span className="font-semibold text-stone-900">
                  {formatPrice(Number(item.totalPrice))}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* Shipping */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Endereco de Entrega</h2>
          <div className="text-sm text-stone-600 space-y-1">
            <p>{order.shippingStreet}, {order.shippingNumber}{order.shippingComplement ? ` - ${order.shippingComplement}` : ''}</p>
            <p>{order.shippingNeighborhood}</p>
            <p>{order.shippingCity} - {order.shippingState}</p>
            <p>CEP: {order.shippingCep}</p>
            <p className="mt-2 text-stone-500">Metodo: {order.shippingMethod}</p>
          </div>
        </section>

        {/* Tracking code */}
        {order.trackingCode && (
          <section className="bg-white rounded-xl border border-stone-200 p-6">
            <h2 className="text-lg font-semibold text-stone-900 mb-4">Rastreamento</h2>
            <div className="text-sm text-stone-600 space-y-2">
              <p>Código de rastreamento:</p>
              <p className="font-mono text-base font-bold text-stone-900 tracking-widest">{order.trackingCode}</p>
              <a
                href="https://www.correios.com.br/rastreamento"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-block mt-2 text-amber-700 hover:underline"
              >
                Rastrear nos Correios →
              </a>
            </div>
          </section>
        )}

        {/* Payment */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Pagamento</h2>
          <div className="text-sm text-stone-600 space-y-1">
            <p>Metodo: {PAYMENT_LABELS[order.paymentMethod] || order.paymentMethod}</p>
            <p>Status: {PAYMENT_STATUS_LABELS[order.paymentStatus] || order.paymentStatus}</p>
          </div>
        </section>

        {/* Totals */}
        <section className="bg-white rounded-xl border border-stone-200 p-6">
          <h2 className="text-lg font-semibold text-stone-900 mb-4">Resumo</h2>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Frete</span>
              <span>{formatPrice(Number(order.shippingCost))}</span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Desconto{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>-{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-stone-900 pt-2 border-t border-stone-200">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
