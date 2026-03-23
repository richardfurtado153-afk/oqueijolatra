'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({ where: { id: orderId }, data: { status: status as any } })
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}
