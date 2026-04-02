import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/utils'
import BannerSlider from '@/components/home/BannerSlider'
import NewsletterBar from '@/components/home/NewsletterBar'
import ProductShowcase from '@/components/home/ProductShowcase'

export const metadata: Metadata = {
  title: 'O Queijolatra | Queijos Artesanais e Especiais',
  description:
    'Compre queijos artesanais brasileiros, importados, cremosos e chocolates especiais. Entrega para todo o Brasil com qualidade e frescor garantidos.',
  alternates: { canonical: '/' },
}

const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'O Queijolatra',
  url: 'https://oqueijolatra.com.br',
  logo: 'https://oqueijolatra.com.br/logo.png',
  sameAs: [],
}

const webSiteJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'O Queijolatra',
  url: 'https://oqueijolatra.com.br',
  potentialAction: {
    '@type': 'SearchAction',
    target: 'https://oqueijolatra.com.br/busca?q={search_term_string}',
    'query-input': 'required name=search_term_string',
  },
}

export default async function HomePage() {
  let banners: Awaited<ReturnType<typeof prisma.banner.findMany>> = []
  let newProducts: Awaited<ReturnType<typeof prisma.product.findMany<{ include: { images: true } }>>> = []
  let bestsellers = newProducts
  let featured = newProducts
  let cat30Queijos = newProducts
  let catChocolates = newProducts
  let catQueijos = newProducts
  let catCremosos = newProducts

  try {
    ;[
      banners,
      newProducts,
      bestsellers,
      featured,
      cat30Queijos,
      catChocolates,
      catQueijos,
      catCremosos,
    ] = await Promise.all([
      prisma.banner.findMany({
        where: { active: true },
        orderBy: { position: 'asc' },
      }),
      prisma.product.findMany({
        where: { isNew: true, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { isBestseller: true, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { featured: true, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { category: { slug: '30-queijos-brasileiros' }, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { category: { slug: 'chocolates' }, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { category: { slug: 'queijos' }, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
      prisma.product.findMany({
        where: { category: { slug: 'cremosos' }, status: 'AVAILABLE' },
        include: { images: { orderBy: { position: 'asc' } } },
        take: 8,
      }),
    ])
  } catch {
    // DB unavailable
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(webSiteJsonLd) }}
      />

      <h1 className="sr-only">O Queijolatra - Queijos Artesanais e Especiais</h1>

      <BannerSlider banners={banners} />

      <NewsletterBar />

      <div className="max-w-7xl mx-auto px-4 space-y-4">
        <ProductShowcase
          title="Lançamentos"
          products={newProducts.map(toCardData)}
        />

        <ProductShowcase
          title="Mais Vendidos"
          products={bestsellers.map(toCardData)}
        />

        <ProductShowcase
          title="Destaques"
          products={featured.map(toCardData)}
        />

        <ProductShowcase
          title="30 Queijos Artesanais Brasileiros"
          link="/30-queijos-brasileiros"
          products={cat30Queijos.map(toCardData)}
        />

        <ProductShowcase
          title="Chocolates"
          link="/chocolates"
          products={catChocolates.map(toCardData)}
        />

        <ProductShowcase
          title="Queijos"
          link="/queijos"
          products={catQueijos.map(toCardData)}
        />

        <ProductShowcase
          title="Queijos Cremosos"
          link="/cremosos"
          products={catCremosos.map(toCardData)}
        />
      </div>
    </>
  )
}
