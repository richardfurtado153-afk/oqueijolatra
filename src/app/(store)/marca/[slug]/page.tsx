import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/utils'
import Breadcrumb from '@/components/category/Breadcrumb'
import ProductGrid from '@/components/product/ProductGrid'
import CategoryPagination from '@/components/category/CategoryPagination'

const PRODUCTS_PER_PAGE = 16

interface BrandPageProps {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: BrandPageProps): Promise<Metadata> {
  const { slug } = await params

  const brand = await prisma.brand.findUnique({
    where: { slug },
    select: { name: true },
  })

  if (!brand) return {}

  const desc = `Compre produtos da marca ${brand.name} na O Queijolatra. Queijos artesanais e especiais com entrega para todo o Brasil.`

  return {
    title: brand.name,
    description: desc,
    alternates: { canonical: `/marca/${slug}` },
    openGraph: {
      title: `${brand.name} | O Queijolatra`,
      description: desc,
      type: 'website',
      url: `/marca/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: brand.name,
      description: desc,
    },
  }
}

export default async function BrandPage({ params, searchParams }: BrandPageProps) {
  const { slug } = await params
  const sp = await searchParams

  const brand = await prisma.brand.findUnique({
    where: { slug },
  })

  if (!brand) notFound()

  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page, 10)) : 1

  const where = {
    brandId: brand.id,
    status: 'AVAILABLE' as const,
  }

  const [products, totalCount] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({ where }),
  ])

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)

  const breadcrumbItems = [
    { name: 'Marcas', href: '/marca' },
    { name: brand.name, href: `/marca/${brand.slug}` },
  ]

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://oqueijolatra.com.br' },
      { '@type': 'ListItem', position: 2, name: 'Marcas', item: 'https://oqueijolatra.com.br/marca' },
      { '@type': 'ListItem', position: 3, name: brand.name, item: `https://oqueijolatra.com.br/marca/${brand.slug}` },
    ],
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-stone-900 mt-4 mb-6">
        {brand.name}
      </h1>

      <div className="flex items-center justify-between mb-4">
        <p className="text-sm text-stone-500">
          {totalCount} {totalCount === 1 ? 'produto' : 'produtos'}
        </p>
      </div>

      <ProductGrid products={products.map(toCardData)} />

      {totalPages > 1 && (
        <CategoryPagination
          currentPage={page}
          totalPages={totalPages}
        />
      )}
    </div>
  )
}
