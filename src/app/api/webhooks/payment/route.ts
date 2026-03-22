import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { paymentProvider } from '@/lib/payment'

export async function POST(request: NextRequest) {
  let payload: unknown
  try {
    payload = await request.json()
  } catch {
    return NextResponse.json({ error: 'Payload invalido' }, { status: 400 })
  }

  try {
    const { orderId, status } = await paymentProvider.handleWebhook(payload)

    if (!orderId) {
      return NextResponse.json({ error: 'orderId nao identificado' }, { status: 400 })
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return NextResponse.json({ error: 'Pedido nao encontrado' }, { status: 404 })
    }

    const paymentStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'FAILED'
    const orderStatus = status === 'CONFIRMED' ? 'PAID' : 'CANCELLED'

    await prisma.order.update({
      where: { id: orderId },
      data: {
        paymentStatus,
        status: orderStatus,
      },
    })

    return NextResponse.json({ received: true })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao processar webhook' }, { status: 500 })
  }
}
