'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({ where: { id: orderId }, data: { status: status as any } })

  // TODO: add trackingCode field in P3-T1
  // When trackingCode is added to the Order model, send shipping notification:
  // if (status === 'SHIPPED') {
  //   const fullOrder = await prisma.order.findUnique({ where: { id: orderId } })
  //   if (fullOrder?.trackingCode) {
  //     await sendShippingNotification({
  //       orderNumber: fullOrder.orderNumber,
  //       email: fullOrder.email,
  //       customerName: fullOrder.customerName,
  //       trackingCode: fullOrder.trackingCode,
  //     }).catch(err => console.error('Shipping email failed:', err))
  //   }
  // }

  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}
