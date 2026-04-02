'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin, slugify } from '@/lib/api'

export async function createBrand(fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  const name = fd.get('name') as string
  await prisma.brand.create({
    data: { name, slug: slugify(name), logoUrl: (fd.get('logoUrl') as string) || null }
  })
  revalidatePath('/admin/marcas')
}

export async function deleteBrand(id: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.brand.delete({ where: { id } })
  revalidatePath('/admin/marcas')
}
