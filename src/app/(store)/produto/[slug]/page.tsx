import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { prisma } from '@/lib/prisma'
import { toCardData } from '@/lib/utils'
import Breadcrumb from '@/components/category/Breadcrumb'
import ProductGallery from '@/components/product/ProductGallery'
import ProductInfo from '@/components/product/ProductInfo'
import ShippingCalculator from '@/components/product/ShippingCalculator'
import RelatedProducts from '@/components/product/RelatedProducts'
import RecentlyViewed from '@/components/ui/RecentlyViewed'
import ProductPageTracker from './ProductPageTracker'
import ProductReviews from '@/components/ProductReviews'

interface ProductPageProps {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, description: true, price: true },
  })

  if (!product) return {}

  const price = Number(product.price)

  const desc =
    product.description?.replace(/<[^>]*>/g, '').slice(0, 160) ||
    `Compre ${product.name} na O Queijolatra. Queijos artesanais com entrega para todo o Brasil.`

  return {
    title: product.name,
    description: desc,
    alternates: { canonical: `/produto/${slug}` },
    openGraph: {
      title: `${product.name} | O Queijolatra`,
      description: desc,
      type: 'website',
      url: `/produto/${slug}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.name,
      description: desc,
    },
    other: {
      'product:price:amount': price.toFixed(2),
      'product:price:currency': 'BRL',
    },
  }
}

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params

  const product = await prisma.product.findUnique({
    where: { slug },
    include: {
      images: { orderBy: { position: 'asc' } },
      brand: true,
      category: {
        include: { parent: { select: { name: true, slug: true } } },
      },
      variations: true,
    },
  })

  if (!product) notFound()

  const price = Number(product.price)
  const compareAtPrice = product.compareAtPrice
    ? Number(product.compareAtPrice)
    : null

  // Fetch related products (same category, excluding current)
  const relatedRaw = await prisma.product.findMany({
    where: {
      categoryId: product.categoryId,
      status: 'AVAILABLE',
      id: { not: product.id },
    },
    include: { images: { orderBy: { position: 'asc' } } },
    take: 4,
  })

  const relatedProducts = relatedRaw.map(toCardData)

  // Build breadcrumb
  const breadcrumbItems = []
  if (product.category.parent) {
    breadcrumbItems.push({
      name: product.category.parent.name,
      href: `/${product.category.parent.slug}`,
    })
  }
  breadcrumbItems.push({
    name: product.category.name,
    href: `/${product.category.slug}`,
  })
  breadcrumbItems.push({
    name: product.name,
    href: `/produto/${product.slug}`,
  })

  // Main image for cart / tracker
  const mainImage =
    product.images.find((i) => i.isMain) || product.images[0]
  const mainImageUrl = mainImage?.url || '/placeholder.jpg'

  // Variations serialized
  const variations = product.variations.map((v) => ({
    id: v.id,
    name: v.name,
    sku: v.sku,
    price: Number(v.price),
    compareAtPrice: v.compareAtPrice ? Number(v.compareAtPrice) : null,
    stock: v.stock,
  }))

  // BreadcrumbList JSON-LD
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

  // Product JSON-LD structured data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    description: product.description?.replace(/<[^>]*>/g, '').slice(0, 500),
    sku: product.sku,
    image: product.images.map((i) => i.url),
    brand: product.brand
      ? { '@type': 'Brand', name: product.brand.name }
      : undefined,
    offers: {
      '@type': 'Offer',
      url: `https://oqueijolatra.com.br/produto/${product.slug}`,
      priceCurrency: 'BRL',
      price: price.toFixed(2),
      availability:
        product.status === 'AVAILABLE' && product.stock > 0
          ? 'https://schema.org/InStock'
          : 'https://schema.org/OutOfStock',
    },
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <Breadcrumb items={breadcrumbItems} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      <ProductPageTracker
        product={{
          id: product.id,
          name: product.name,
          slug: product.slug,
          image: mainImageUrl,
          price,
        }}
      />

      {/* Two-column layout */}
      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        {/* Left: Gallery */}
        <div className="w-full lg:w-1/2 lg:max-w-[500px]">
          <ProductGallery
            images={product.images.map((i) => ({
              id: i.id,
              url: i.url,
              alt: i.alt,
            }))}
            productName={product.name}
          />
        </div>

        {/* Right: Info */}
        <div className="w-full lg:flex-1 min-w-0">
          <ProductInfo
            product={{
              id: product.id,
              name: product.name,
              slug: product.slug,
              sku: product.sku,
              price,
              compareAtPrice,
              stock: product.stock,
              status: product.status,
              image: mainImageUrl,
            }}
            brand={
              product.brand
                ? { name: product.brand.name, slug: product.brand.slug }
                : null
            }
            variations={variations}
          />

          <div className="mt-6 border-t border-stone-200 pt-6">
            <ShippingCalculator />
          </div>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <section className="mt-10">
          <h2 className="text-xl font-bold text-stone-900 mb-4">{"Descri\u00e7\u00e3o"}</h2>
          <div
            className="prose prose-stone max-w-none"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </section>
      )}

      {/* Related products */}
      <div className="mt-10">
        <RelatedProducts products={relatedProducts} />
      </div>

      {/* Reviews */}
      <ProductReviews productId={product.id} />

      {/* Recently Viewed sidebar */}
      <div className="mt-10 max-w-xs">
        <RecentlyViewed />
      </div>
    </div>
  )
}
