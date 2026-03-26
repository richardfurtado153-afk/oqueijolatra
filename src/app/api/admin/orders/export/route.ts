import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  const orders = await prisma.order.findMany({
    orderBy: { createdAt: 'desc' },
    include: { items: true },
  })

  const headers = [
    'Pedido',
    'Data',
    'Cliente',
    'Email',
    'CPF',
    'Status',
    'Pagamento',
    'Subtotal',
    'Frete',
    'Desconto',
    'Total',
    'Rastreio',
  ]

  const rows = orders.map((o) => [
    o.orderNumber,
    new Date(o.createdAt).toLocaleDateString('pt-BR'),
    o.customerName,
    o.email,
    o.cpf,
    o.status,
    o.paymentMethod,
    Number(o.subtotal).toFixed(2),
    Number(o.shippingCost).toFixed(2),
    Number(o.discount).toFixed(2),
    Number(o.total).toFixed(2),
    o.trackingCode || '',
  ])

  const csv = [headers.join(';'), ...rows.map((r) => r.join(';'))].join('\n')

  return new NextResponse(csv, {
    headers: {
      'Content-Type': 'text/csv; charset=utf-8',
      'Content-Disposition': `attachment; filename=pedidos-${new Date().toISOString().split('T')[0]}.csv`,
    },
  })
}
