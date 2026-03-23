import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [totalOrders, totalRevenue, totalProducts, totalCustomers, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: 'CONFIRMED' }, _sum: { total: true } }),
    prisma.product.count(),
    prisma.customer.count({ where: { isAdmin: false } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
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
    </div>
  )
}
