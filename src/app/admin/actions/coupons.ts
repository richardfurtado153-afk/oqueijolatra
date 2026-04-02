'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/api'

export async function createCoupon(fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  const type = fd.get('type') as 'PERCENT' | 'FIXED'
  await prisma.coupon.create({
    data: {
      code: (fd.get('code') as string).toUpperCase(),
      type,
      discountPercent: type === 'PERCENT' ? parseInt(fd.get('discountValue') as string) : null,
      discountValue: type === 'FIXED' ? parseFloat(fd.get('discountValue') as string) : null,
      minOrderValue: fd.get('minOrderValue') ? parseFloat(fd.get('minOrderValue') as string) : null,
      usageLimit: fd.get('usageLimit') ? parseInt(fd.get('usageLimit') as string) : null,
      validFrom: new Date(fd.get('validFrom') as string),
      validUntil: new Date(fd.get('validUntil') as string),
      active: true,
    }
  })
  revalidatePath('/admin/cupons')
}

export async function toggleCoupon(id: string, active: boolean) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.coupon.update({ where: { id }, data: { active } })
  revalidatePath('/admin/cupons')
}
