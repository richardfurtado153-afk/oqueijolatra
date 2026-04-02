'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin } from '@/lib/api'

export async function createBanner(fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.banner.create({
    data: {
      title: fd.get('title') as string,
      imageUrl: fd.get('imageUrl') as string,
      link: fd.get('link') as string,
      position: parseInt(fd.get('position') as string) || 0,
      active: fd.get('active') === 'on',
    }
  })
  revalidatePath('/admin/banners')
}

export async function toggleBanner(id: string, active: boolean) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.banner.update({ where: { id }, data: { active } })
  revalidatePath('/admin/banners')
}

export async function deleteBanner(id: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.banner.delete({ where: { id } })
  revalidatePath('/admin/banners')
}
