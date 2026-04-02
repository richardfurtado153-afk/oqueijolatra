import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/utils'
import Breadcrumb from '@/components/category/Breadcrumb'
import CategorySidebar from '@/components/category/CategorySidebar'
import ProductGrid from '@/components/product/ProductGrid'
import CategoryPagination from '@/components/category/CategoryPagination'

const PRODUCTS_PER_PAGE = 16

interface CategoryPageProps {
  params: Promise<{ category: string }>
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  params,
}: CategoryPageProps): Promise<Metadata> {
  const { category: slug } = await params

  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true, description: true },
  })

  if (!category) return {}

  const desc =
    category.description ||
    `Compre ${category.name} na O Queijolatra. Os melhores queijos artesanais com entrega para todo o Brasil.`

  return {
    title: category.name,
    description: desc,
    alternates: { canonical: `/${slug}` },
    openGraph: {
      title: `${category.name} | O Queijolatra`,
      description: desc,
      type: 'website',
      url: `/${slug}`,
    },
    twitter: {
      card: 'summary',
      title: category.name,
      description: desc,
    },
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: CategoryPageProps) {
  const { category: slug } = await params
  const sp = await searchParams

  const category = await prisma.category.findUnique({
    where: { slug },
    include: {
      parent: { select: { name: true, slug: true } },
      children: { select: { id: true, name: true, slug: true } },
    },
  })

  if (!category) notFound()

  // Parse search params
  const brandSlug = typeof sp.brand === 'string' ? sp.brand : undefined
  const minPrice = typeof sp.minPrice === 'string' ? Number(sp.minPrice) : undefined
  const maxPrice = typeof sp.maxPrice === 'string' ? Number(sp.maxPrice) : undefined
  const page = typeof sp.page === 'string' ? Math.max(1, parseInt(sp.page, 10)) : 1

  // Build product filter
  const childIds = category.children.map((c) => c.id)
  const categoryIds = [category.id, ...childIds]

  const where: Record<string, unknown> = {
    categoryId: { in: categoryIds },
    status: 'AVAILABLE' as const,
  }

  if (brandSlug) {
    where.brand = { slug: brandSlug }
  }

  if (minPrice !== undefined || maxPrice !== undefined) {
    const priceFilter: Record<string, number> = {}
    if (minPrice !== undefined) priceFilter.gte = minPrice
    if (maxPrice !== undefined) priceFilter.lte = maxPrice
    where.price = priceFilter
  }

  // Fetch products + total count in parallel with filter data
  const [products, totalCount, brandAgg, siblingCategories] = await Promise.all([
    prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * PRODUCTS_PER_PAGE,
      take: PRODUCTS_PER_PAGE,
    }),
    prisma.product.count({ where }),
    // Get brands with product counts for this category
    prisma.product.groupBy({
      by: ['brandId'],
      where: {
        categoryId: { in: categoryIds },
        status: 'AVAILABLE',
        brandId: { not: null },
      },
      _count: { id: true },
    }),
    // Get sibling/related categories for the sidebar
    category.parentId
      ? prisma.category.findMany({
          where: { parentId: category.parentId },
          select: { name: true, slug: true, _count: { select: { products: true } } },
          orderBy: { position: 'asc' },
        })
      : prisma.category.findMany({
          where: { parentId: null },
          select: { name: true, slug: true, _count: { select: { products: true } } },
          orderBy: { position: 'asc' },
        }),
  ])

  // Resolve brand names from IDs
  const brandIds = brandAgg
    .map((b) => b.brandId)
    .filter((id): id is string => id !== null)

  const brandRecords =
    brandIds.length > 0
      ? await prisma.brand.findMany({
          where: { id: { in: brandIds } },
          select: { id: true, name: true, slug: true },
        })
      : []

  const brandsWithCount = brandRecords.map((brand) => {
    const agg = brandAgg.find((b) => b.brandId === brand.id)
    return {
      name: brand.name,
      slug: brand.slug,
      count: agg?._count?.id ?? 0,
    }
  })

  const categoriesForSidebar = siblingCategories.map((cat) => ({
    name: cat.name,
    slug: cat.slug,
    count: cat._count.products,
  }))

  const totalPages = Math.ceil(totalCount / PRODUCTS_PER_PAGE)

  // Breadcrumb items
  const breadcrumbItems = []
  if (category.parent) {
    breadcrumbItems.push({
      name: category.parent.name,
      href: `/${category.parent.slug}`,
    })
  }
  breadcrumbItems.push({ name: category.name, href: `/${category.slug}` })

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Home',
        item: 'https://oqueijolatra.com.br',
      },
      ...breadcrumbItems.map((item, index) => ({
        '@type': 'ListItem',
        position: index + 2,
        name: item.name,
        item: `https://oqueijolatra.com.br${item.href}`,
      })),
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
        {category.name}
      </h1>

      <div className="flex flex-col lg:flex-row gap-8">
        <CategorySidebar
          categories={categoriesForSidebar}
          brands={brandsWithCount}
          currentCategorySlug={slug}
        />

        <div className="flex-1 min-w-0">
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
      </div>
    </div>
  )
}
