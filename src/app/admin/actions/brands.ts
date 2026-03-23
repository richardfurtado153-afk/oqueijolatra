'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createBrand(fd: FormData) {
  const name = fd.get('name') as string
  const slug = name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
  await prisma.brand.create({ data: { name, slug, logoUrl: (fd.get('logoUrl') as string) || null } })
  revalidatePath('/admin/marcas')
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } })
  revalidatePath('/admin/marcas')
}
