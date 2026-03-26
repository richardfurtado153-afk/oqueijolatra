import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateOrderStatus } from '../../actions/orders'

const STATUS_LIST = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', PAID: 'Pago', PROCESSING: 'Processando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Pedido #{order.orderNumber}</h1>
      <p className="text-stone-500 mb-6">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <h2 className="font-semibold mb-3 text-stone-700">Cliente</h2>
          <p>{order.customerName}</p>
          <p className="text-stone-500">{order.email}</p>
          <p className="text-stone-500">{order.phone}</p>
          <p className="text-stone-500 text-sm mt-2">CPF: {order.cpf}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <h2 className="font-semibold mb-3 text-stone-700">Entrega</h2>
          <p>{order.shippingStreet}, {order.shippingNumber}</p>
          <p>{order.shippingNeighborhood}</p>
          <p>{order.shippingCity} - {order.shippingState}</p>
          <p>CEP: {order.shippingCep}</p>
          <p className="text-stone-500 text-sm mt-2">{order.shippingMethod} — R$ {Number(order.shippingCost).toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3">Produto</th>
              <th className="text-right px-4 py-3">Qtd</th>
              <th className="text-right px-4 py-3">Unitário</th>
              <th className="text-right px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="px-4 py-3">{item.productName}{item.variationName ? ` — ${item.variationName}` : ''}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">R$ {Number(item.unitPrice).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3 text-right font-medium">R$ {Number(item.totalPrice).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-stone-50">
            <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Subtotal</td><td className="px-4 py-2 text-right">R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}</td></tr>
            {Number(order.discount) > 0 && <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Desconto</td><td className="px-4 py-2 text-right text-green-600">-R$ {Number(order.discount).toFixed(2).replace('.', ',')}</td></tr>}
            <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Frete</td><td className="px-4 py-2 text-right">R$ {Number(order.shippingCost).toFixed(2).replace('.', ',')}</td></tr>
            <tr><td colSpan={3} className="px-4 py-3 text-right font-bold">Total</td><td className="px-4 py-3 text-right font-bold text-lg">R$ {Number(order.total).toFixed(2).replace('.', ',')}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-3 text-stone-700">Atualizar Status</h2>
        <form action={async (fd: FormData) => {
          'use server'
          await updateOrderStatus(
            fd.get('orderId') as string,
            fd.get('status') as string,
            fd.get('trackingCode') as string,
          )
        }} className="space-y-3">
          <input type="hidden" name="orderId" value={order.id} />
          <div className="mb-3">
            <label className="block text-sm text-stone-600 mb-1">Código de rastreamento (SEDEX/PAC)</label>
            <input
              name="trackingCode"
              type="text"
              defaultValue={order.trackingCode ?? ''}
              placeholder="Ex: BR123456789BR"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm font-mono uppercase"
            />
          </div>
          <div className="flex gap-3">
            <select name="status" defaultValue={order.status}
              className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1">
              {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
            </select>
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
              Salvar
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
