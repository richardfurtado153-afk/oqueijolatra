import { prisma } from '@/lib/prisma'
import BannerSlider from '@/components/home/BannerSlider'
import NewsletterBar from '@/components/home/NewsletterBar'
import ProductShowcase from '@/components/home/ProductShowcase'
import { type ProductCardData } from '@/components/product/ProductCard'

function toCardData(
  product: {
    id: string
    name: string
    slug: string
    price: { toNumber?: () => number } | number
    compareAtPrice: { toNumber?: () => number } | number | null
    images: { url: string; isMain: boolean }[]
  }
): ProductCardData {
  const price = typeof product.price === 'number' ? product.price : Number(product.price)
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
