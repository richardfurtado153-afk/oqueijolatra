import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', PAID: 'Pago', PROCESSING: 'Processando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800', SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { items: { select: { quantity: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Pedidos</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <Link key={s} href={s ? `/admin/pedidos?status=${s}` : '/admin/pedidos'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              (status ?? '') === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400'
            }`}>
            {s ? STATUS_LABELS[s] : 'Todos'}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {['Pedido', 'Data', 'Cliente', 'Total', 'Pagamento', 'Status', 'Ação'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-stone-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 font-mono">#{o.orderNumber}</td>
                <td className="px-4 py-3 text-stone-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 font-medium">R$ {Number(o.total).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-amber-700 hover:underline">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-stone-400">Nenhum pedido encontrado</div>
        )}
      </div>
    </div>
  )
}
