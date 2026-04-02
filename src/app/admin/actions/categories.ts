'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { requireAdmin, slugify } from '@/lib/api'

export async function createCategory(fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  const name = fd.get('name') as string
  await prisma.category.create({
    data: { name, slug: slugify(name), parentId: (fd.get('parentId') as string) || null }
  })
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categorias')
}
