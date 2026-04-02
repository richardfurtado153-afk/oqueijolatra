import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/utils'
import Breadcrumb from '@/components/category/Breadcrumb'
import ProductGrid from '@/components/product/ProductGrid'

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

export async function generateMetadata({
  searchParams,
}: SearchPageProps): Promise<Metadata> {
  const sp = await searchParams
  const q = typeof sp.q === 'string' ? sp.q : ''

  return {
    title: q ? `Busca: ${q}` : 'Busca',
    description: q
      ? `Resultados de busca para "${q}" na O Queijolatra.`
      : 'Busque queijos artesanais, cremosos, importados e chocolates na O Queijolatra.',
    robots: { index: false, follow: true },
    alternates: { canonical: '/busca' },
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
            <div className="flex flex-col items-center justify-center py-16 text-center">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-lg font-medium text-stone-600 mb-1">Nenhum resultado para &ldquo;{q}&rdquo;</p>
              <p className="text-sm text-stone-400">Tente buscar por outros termos ou explore nossas categorias.</p>
            </div>
          ) : (
            <ProductGrid products={products} />
          )}
        </>
      ) : (
        <div className="flex flex-col items-center justify-center py-16 text-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-lg font-medium text-stone-600 mb-1">O que voce procura?</p>
          <p className="text-sm text-stone-400">Use a barra de busca acima para encontrar queijos, marcas e mais.</p>
        </div>
      )}
    </div>
  )
}
