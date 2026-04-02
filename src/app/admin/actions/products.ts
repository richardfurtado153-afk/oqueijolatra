'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { requireAdmin, slugify } from '@/lib/api'

export async function deleteProduct(productId: string) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.product.delete({ where: { id: productId } })
  revalidatePath('/admin/produtos')
}

export async function createProduct(fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  const name = fd.get('name') as string

  await prisma.product.create({
    data: {
      name,
      slug: slugify(name),
      sku: fd.get('sku') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      compareAtPrice: fd.get('compareAtPrice') ? parseFloat(fd.get('compareAtPrice') as string) : null,
      stock: parseInt(fd.get('stock') as string) || 0,
      weight: parseFloat(fd.get('weight') as string) || 0.5,
      categoryId: fd.get('categoryId') as string,
      brandId: (fd.get('brandId') as string) || null,
      featured: fd.get('featured') === 'on',
      isBestseller: fd.get('isBestseller') === 'on',
      isNew: fd.get('isNew') === 'on',
      images: fd.get('imageUrl') ? {
        create: { url: fd.get('imageUrl') as string, isMain: true, position: 0 }
      } : undefined,
    },
  })
  redirect('/admin/produtos')
}

export async function updateProduct(productId: string, fd: FormData) {
  const auth = await requireAdmin()
  if (auth.error) throw new Error('Sem permissao')

  await prisma.product.update({
    where: { id: productId },
    data: {
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      compareAtPrice: fd.get('compareAtPrice') ? parseFloat(fd.get('compareAtPrice') as string) : null,
      stock: parseInt(fd.get('stock') as string) || 0,
      weight: parseFloat(fd.get('weight') as string) || 0.5,
      categoryId: fd.get('categoryId') as string,
      brandId: (fd.get('brandId') as string) || null,
      featured: fd.get('featured') === 'on',
      isBestseller: fd.get('isBestseller') === 'on',
      isNew: fd.get('isNew') === 'on',
    },
  })
  redirect('/admin/produtos')
}
