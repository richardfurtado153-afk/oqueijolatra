import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [totalOrders, totalRevenue, totalProducts, totalCustomers, pendingOrders, lowStockProducts] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: 'CONFIRMED' }, _sum: { total: true } }),
    prisma.product.count(),
    prisma.customer.count({ where: { isAdmin: false } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
    prisma.product.findMany({
      where: { stock: { lte: 5 }, status: 'AVAILABLE' },
      select: { id: true, name: true, slug: true, sku: true, stock: true },
      orderBy: { stock: 'asc' },
      take: 20,
    }),
  ])

  const revenueValue = Number(totalRevenue._sum.total ?? 0)

  const stats = [
    { label: 'Pedidos Total', value: totalOrders, color: 'bg-blue-500' },
    { label: 'Pedidos Pendentes', value: pendingOrders, color: 'bg-amber-500' },
    { label: 'Receita Confirmada', value: `R$ ${revenueValue.toFixed(2).replace('.', ',')}`, color: 'bg-green-500' },
    { label: 'Produtos', value: totalProducts, color: 'bg-purple-500' },
    { label: 'Clientes', value: totalCustomers, color: 'bg-pink-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <div className={`w-3 h-3 rounded-full ${s.color} mb-3`} />
            <div className="text-2xl font-bold text-stone-800">{s.value}</div>
            <div className="text-sm text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
      {lowStockProducts.length > 0 && (
        <div className="mt-8">
          <h2 className="text-lg font-bold text-stone-800 mb-4 flex items-center gap-2">
            <svg className="w-5 h-5 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4.5c-.77-.833-2.194-.833-2.964 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            Estoque Baixo
          </h2>
          <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-red-50 border-b border-stone-200">
                <tr>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Produto</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">SKU</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Estoque</th>
                  <th className="text-left px-4 py-3 text-stone-600 font-medium">Ação</th>
                </tr>
              </thead>
              <tbody>
                {lowStockProducts.map((p) => (
                  <tr key={p.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 font-medium">{p.name}</td>
                    <td className="px-4 py-3 text-stone-500 font-mono text-xs">{p.sku}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                        p.stock === 0 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                      }`}>
                        {p.stock} un.
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <a href={`/admin/produtos/${p.id}/editar`} className="text-amber-700 hover:underline text-sm">
                        Editar
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
