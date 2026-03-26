import { prisma } from '@/lib/prisma'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente',
  PAID: 'Pago',
  PROCESSING: 'Processando',
  SHIPPED: 'Enviado',
  DELIVERED: 'Entregue',
  CANCELLED: 'Cancelado',
}

const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-400',
  PAID: 'bg-green-400',
  PROCESSING: 'bg-blue-400',
  SHIPPED: 'bg-purple-400',
  DELIVERED: 'bg-emerald-400',
  CANCELLED: 'bg-red-400',
}

function formatCurrency(value: number) {
  return `R$ ${value.toFixed(2).replace('.', ',')}`
}

export default async function AdminReports() {
  const twelveMonthsAgo = new Date()
  twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12)

  const thirtyDaysAgo = new Date()
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

  const [orders, topProducts, statusCounts, recentOrders] = await Promise.all([
    prisma.order.findMany({
      where: { paymentStatus: 'CONFIRMED', createdAt: { gte: twelveMonthsAgo } },
      select: { total: true, createdAt: true },
    }),
    prisma.orderItem.groupBy({
      by: ['productName'],
      _sum: { quantity: true, totalPrice: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: 10,
    }),
    prisma.order.groupBy({
      by: ['status'],
      _count: true,
    }),
    prisma.order.findMany({
      where: { createdAt: { gte: thirtyDaysAgo } },
      select: { createdAt: true },
    }),
  ])

  // Group revenue by month
  const monthlyRevenue = new Map<string, number>()
  orders.forEach((o) => {
    const key = `${o.createdAt.getFullYear()}-${String(o.createdAt.getMonth() + 1).padStart(2, '0')}`
    monthlyRevenue.set(key, (monthlyRevenue.get(key) ?? 0) + Number(o.total))
  })

  // Build sorted month list for last 12 months
  const months: { key: string; label: string; value: number }[] = []
  const now = new Date()
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1)
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
    const label = d.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' })
    months.push({ key, label, value: monthlyRevenue.get(key) ?? 0 })
  }
  const maxRevenue = Math.max(...months.map((m) => m.value), 1)

  // Daily orders for last 30 days
  const dailyCounts = new Map<string, number>()
  recentOrders.forEach((o) => {
    const key = o.createdAt.toISOString().split('T')[0]
    dailyCounts.set(key, (dailyCounts.get(key) ?? 0) + 1)
  })

  const days: { key: string; label: string; value: number }[] = []
  for (let i = 29; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    const key = d.toISOString().split('T')[0]
    const label = d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' })
    days.push({ key, label, value: dailyCounts.get(key) ?? 0 })
  }
  const maxDaily = Math.max(...days.map((d) => d.value), 1)

  // Status totals
  const totalOrderCount = statusCounts.reduce((sum, s) => sum + s._count, 0)

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Relatorios</h1>

      {/* Revenue Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6 mb-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Receita Mensal (ultimos 12 meses)</h2>
        <div className="flex items-end gap-2" style={{ height: '220px' }}>
          {months.map((m) => {
            const heightPercent = maxRevenue > 0 ? (m.value / maxRevenue) * 100 : 0
            return (
              <div key={m.key} className="flex-1 flex flex-col items-center justify-end h-full">
                <div className="text-xs text-stone-500 mb-1 font-medium">
                  {m.value > 0 ? formatCurrency(m.value) : ''}
                </div>
                <div
                  className="w-full bg-amber-500 rounded-t-md transition-all min-h-[2px]"
                  style={{ height: `${Math.max(heightPercent, 1)}%` }}
                  title={`${m.label}: ${formatCurrency(m.value)}`}
                />
                <div className="text-xs text-stone-400 mt-2 whitespace-nowrap">{m.label}</div>
              </div>
            )
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Top Products */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-x-auto">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800">Top 10 Produtos</h2>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-stone-50 border-b border-stone-200">
              <tr>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">#</th>
                <th className="text-left px-4 py-3 text-stone-600 font-medium">Produto</th>
                <th className="text-right px-4 py-3 text-stone-600 font-medium">Qtd</th>
                <th className="text-right px-4 py-3 text-stone-600 font-medium">Receita</th>
              </tr>
            </thead>
            <tbody>
              {topProducts.map((p, i) => (
                <tr key={p.productName} className="border-b border-stone-100 hover:bg-stone-50">
                  <td className="px-4 py-3 text-stone-400">{i + 1}</td>
                  <td className="px-4 py-3 font-medium text-stone-800">{p.productName}</td>
                  <td className="px-4 py-3 text-right text-stone-600">{p._sum.quantity ?? 0}</td>
                  <td className="px-4 py-3 text-right text-stone-600">
                    {formatCurrency(Number(p._sum.totalPrice ?? 0))}
                  </td>
                </tr>
              ))}
              {topProducts.length === 0 && (
                <tr>
                  <td colSpan={4} className="text-center py-8 text-stone-400">
                    Nenhum produto vendido ainda
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Orders by Status */}
        <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-x-auto">
          <div className="px-6 py-4 border-b border-stone-200">
            <h2 className="text-lg font-semibold text-stone-800">Pedidos por Status</h2>
          </div>
          <div className="p-6 space-y-4">
            {statusCounts.map((s) => {
              const percent = totalOrderCount > 0 ? (s._count / totalOrderCount) * 100 : 0
              return (
                <div key={s.status}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="text-stone-700 font-medium">
                      {STATUS_LABELS[s.status] ?? s.status}
                    </span>
                    <span className="text-stone-500">
                      {s._count} ({percent.toFixed(1)}%)
                    </span>
                  </div>
                  <div className="w-full bg-stone-100 rounded-full h-3">
                    <div
                      className={`h-3 rounded-full ${STATUS_COLORS[s.status] ?? 'bg-stone-400'}`}
                      style={{ width: `${Math.max(percent, 1)}%` }}
                    />
                  </div>
                </div>
              )
            })}
            {statusCounts.length === 0 && (
              <div className="text-center py-8 text-stone-400">Nenhum pedido encontrado</div>
            )}
          </div>
        </div>
      </div>

      {/* Daily Orders Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 p-6">
        <h2 className="text-lg font-semibold text-stone-800 mb-4">Pedidos Diarios (ultimos 30 dias)</h2>
        <div className="flex items-end gap-1" style={{ height: '180px' }}>
          {days.map((d) => {
            const heightPercent = maxDaily > 0 ? (d.value / maxDaily) * 100 : 0
            return (
              <div key={d.key} className="flex-1 flex flex-col items-center justify-end h-full">
                {d.value > 0 && (
                  <div className="text-xs text-stone-500 mb-1">{d.value}</div>
                )}
                <div
                  className="w-full bg-amber-400 rounded-t-sm transition-all min-h-[2px]"
                  style={{ height: `${Math.max(heightPercent, 1)}%` }}
                  title={`${d.label}: ${d.value} pedidos`}
                />
                {/* Show label every 5 days to avoid clutter */}
                <div className="text-[10px] text-stone-400 mt-1 whitespace-nowrap">
                  {days.indexOf(d) % 5 === 0 ? d.label : ''}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
