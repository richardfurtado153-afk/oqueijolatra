'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string, trackingCode?: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: {
      status: status as any,
      ...(trackingCode !== undefined ? { trackingCode: trackingCode || null } : {}),
    }
  })

  if (status === 'SHIPPED' && trackingCode) {
    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (order) {
      const { sendShippingNotification } = await import('@/lib/email')
      await sendShippingNotification({
        orderNumber: order.orderNumber,
        email: order.email,
        customerName: order.customerName,
        trackingCode,
      }).catch(err => console.error('Shipping email failed:', err))
    }
  }

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}
