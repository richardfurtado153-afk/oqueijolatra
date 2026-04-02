import type { MetadataRoute } from 'next'
import { prisma } from '@/lib/prisma'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXTAUTH_URL || 'https://oqueijolatra.com.br'

  let products: { slug: string; updatedAt: Date }[] = []
  let categories: { slug: string; updatedAt: Date }[] = []
  let brands: { slug: string; updatedAt: Date }[] = []

  try {
    ;[products, categories, brands] = await Promise.all([
      prisma.product.findMany({
        where: { status: 'AVAILABLE' },
        select: { slug: true, updatedAt: true },
      }),
      prisma.category.findMany({
        select: { slug: true, updatedAt: true },
      }),
      prisma.brand.findMany({
        select: { slug: true, updatedAt: true },
      }),
    ])
  } catch {
    // DB unavailable — return static entries only
  }

  const staticEntries: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1.0,
    },
  ]

  const categoryEntries: MetadataRoute.Sitemap = categories.map((category) => ({
    url: `${baseUrl}/${category.slug}`,
    lastModified: category.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const productEntries: MetadataRoute.Sitemap = products.map((product) => ({
    url: `${baseUrl}/produto/${product.slug}`,
    lastModified: product.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.7,
  }))

  const brandEntries: MetadataRoute.Sitemap = brands.map((brand) => ({
    url: `${baseUrl}/marca/${brand.slug}`,
    lastModified: brand.updatedAt,
    changeFrequency: 'weekly',
    priority: 0.6,
  }))

  return [...staticEntries, ...categoryEntries, ...productEntries, ...brandEntries]
}
