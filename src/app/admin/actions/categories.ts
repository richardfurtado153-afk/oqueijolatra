'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(fd: FormData) {
  const name = fd.get('name') as string
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  await prisma.category.create({
    data: { name, slug, parentId: (fd.get('parentId') as string) || null }
  })
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categorias')
}
