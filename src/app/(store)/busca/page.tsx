import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { type ProductCardData } from '@/components/product/ProductCard'
import Breadcrumb from '@/components/category/Breadcrumb'
import ProductGrid from '@/components/product/ProductGrid'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function toCardData(
  product: {
    id: string
    name: string
    slug: string
    price: { toNumber?: () => number } | number
    compareAtPrice: { toNumber?: () => number } | number | null
    images: { url: string; isMain: boolean }[]
  },
): ProductCardData {
  const price =
    typeof product.price === 'number' ? product.price : Number(product.price)
  const compareAtPrice = product.compareAtPrice
    ? typeof product.compareAtPrice === 'number'
      ? product.compareAtPrice
      : Number(product.compareAtPrice)
    : null
  const mainImage = product.images.find((i) => i.isMain) || product.images[0]
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price,
    compareAtPrice,
    image: mainImage?.url || '/placeholder.jpg',
  }
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''

  return {
    title: q ? `Busca: ${q} | O Queijolatra` : 'Busca | O Queijolatra',
    description: q
      ? `Resultados de busca para "${q}" na O Queijolatra.`
      : 'Busque produtos na O Queijolatra.',
  }
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q.trim() : ''

  let products: ReturnType<typeof toCardData>[] = []

  if (q) {
    const results = await prisma.product.findMany({
      where: {
        status: 'AVAILABLE',
        OR: [
          { name: { contains: q, mode: 'insensitive' } },
          { description: { contains: q, mode: 'insensitive' } },
          { sku: { contains: q, mode: 'insensitive' } },
        ],
      },
      include: { images: { orderBy: { position: 'asc' } } },
      orderBy: { createdAt: 'desc' },
      take: 48,
    })

    products = results.map(toCardData)
  }

  const breadcrumbItems = [{ name: 'Busca', href: '/busca' }]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />

      <h1 className="text-2xl font-bold text-stone-900 mt-4 mb-6">
        {q ? `Resultados para "${q}"` : 'Busca'}
      </h1>

      {q ? (
        <>
          <p className="text-sm text-stone-500 mb-4">
            {products.length} {products.length === 1 ? 'produto encontrado' : 'produtos encontrados'}
          </p>

          {products.length === 0 ? (
            <div className="flex items-center justify-center py-16 text-stone-500">
              <p>Nenhum resultado para &ldquo;{q}&rdquo;</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </>
      ) : (
        <div className="flex items-center justify-center py-16 text-stone-500">
          <p>Digite algo para buscar.</p>
        </div>
      )}
    </div>
  )
}
