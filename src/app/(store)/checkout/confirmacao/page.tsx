import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { formatPrice } from '@/lib/utils'
import PurchaseTracker from './PurchaseTracker'

interface Props {
  searchParams: Promise<{ order?: string }>
}

export default async function ConfirmacaoPage({ searchParams }: Props) {
  const params = await searchParams
  const orderNumber = params.order

  if (!orderNumber) redirect('/checkout')

  const session = await getServerSession(authOptions)
  if (!session?.user) redirect('/conta/login')

  const customerId = (session.user as { id: string }).id

  const order = await prisma.order.findUnique({
    where: { orderNumber: parseInt(orderNumber, 10) },
    include: { items: true },
  })

  if (!order || order.customerId !== customerId) {
    redirect('/checkout')
  }

  const estimatedDays = order.shippingMethod.toLowerCase().includes('expresso') ? 3 : 7

  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <PurchaseTracker
        orderNumber={order.orderNumber}
        total={Number(order.total)}
      />

      <div className="text-center mb-8">
        <div className="w-16 h-16 mx-auto mb-4 bg-green-100 rounded-full flex items-center justify-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-stone-800">Pedido Confirmado!</h1>
        <p className="text-stone-500 mt-1">
          Pedido #{order.orderNumber}
        </p>
      </div>

      <div className="space-y-6">
        {/* Status */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
            Status do Pedido
          </h2>
          <span className="inline-block px-3 py-1 bg-amber-100 text-amber-800 text-sm font-medium rounded-full">
            {order.status === 'PENDING' ? 'Aguardando Pagamento' : order.status}
          </span>
        </div>

        {/* Items */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
            Itens do Pedido
          </h2>
          <div className="space-y-3">
            {order.items.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <div>
                  <span className="text-stone-800">{item.productName}</span>
                  {item.variationName && (
                    <span className="text-stone-500 ml-1">({item.variationName})</span>
                  )}
                  <span className="text-stone-500 ml-2">x{item.quantity}</span>
                </div>
                <span className="font-medium text-stone-800">
                  {formatPrice(Number(item.totalPrice))}
                </span>
              </div>
            ))}
          </div>

          <div className="border-t border-stone-200 mt-4 pt-4 space-y-2 text-sm">
            <div className="flex justify-between text-stone-600">
              <span>Subtotal</span>
              <span>{formatPrice(Number(order.subtotal))}</span>
            </div>
            <div className="flex justify-between text-stone-600">
              <span>Frete ({order.shippingMethod})</span>
              <span>
                {Number(order.shippingCost) === 0
                  ? 'Gratis'
                  : formatPrice(Number(order.shippingCost))}
              </span>
            </div>
            {Number(order.discount) > 0 && (
              <div className="flex justify-between text-green-700">
                <span>Desconto{order.couponCode ? ` (${order.couponCode})` : ''}</span>
                <span>-{formatPrice(Number(order.discount))}</span>
              </div>
            )}
            <div className="border-t border-stone-300 pt-2 flex justify-between font-semibold text-stone-800">
              <span>Total</span>
              <span>{formatPrice(Number(order.total))}</span>
            </div>
          </div>
        </div>

        {/* Shipping Info */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
            Endereco de Entrega
          </h2>
          <p className="text-sm text-stone-600">
            {order.shippingStreet}, {order.shippingNumber}
            {order.shippingComplement ? ` - ${order.shippingComplement}` : ''}
          </p>
          <p className="text-sm text-stone-600">
            {order.shippingNeighborhood} - {order.shippingCity}/{order.shippingState}
          </p>
          <p className="text-sm text-stone-600">CEP: {order.shippingCep}</p>
          <p className="text-sm text-stone-500 mt-2">
            Previsao de entrega: {estimatedDays} dias uteis
          </p>
        </div>

        {/* Payment Info */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <h2 className="text-sm font-semibold text-stone-700 uppercase tracking-wide mb-3">
            Pagamento
          </h2>
          {order.paymentMethod === 'PIX' ? (
            <div className="space-y-2">
              <p className="text-sm text-stone-600">
                Metodo: <span className="font-medium">PIX</span>
              </p>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-sm text-amber-800">
                  Voce recebera as instrucoes de pagamento PIX por email.
                  O pedido sera processado apos a confirmacao do pagamento.
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              <p className="text-sm text-stone-600">
                Metodo: <span className="font-medium">Cartao de Credito</span>
              </p>
              <p className="text-sm text-stone-500">
                {order.paymentStatus === 'CONFIRMED'
                  ? 'Pagamento confirmado.'
                  : 'Pagamento em processamento.'}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Link
            href="/conta/pedidos"
            className="flex-1 text-center py-3 bg-stone-800 text-white font-semibold rounded-lg hover:bg-stone-900 transition-colors"
          >
            Meus Pedidos
          </Link>
          <Link
            href="/"
            className="flex-1 text-center py-3 border border-stone-300 text-stone-800 font-semibold rounded-lg hover:bg-stone-50 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    </div>
  )
}
