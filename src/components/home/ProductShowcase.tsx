import type { ProductCardData } from '@/types'
import Carousel from '@/components/ui/Carousel'
import ProductCard from '@/components/product/ProductCard'

interface ProductShowcaseProps {
  title: string
  link?: string
  products: ProductCardData[]
}

export default function ProductShowcase({ title, link, products }: ProductShowcaseProps) {
  if (products.length === 0) return null

  return (
    <Carousel
      title={title}
      link={link ? { label: 'Ver todos', href: link } : undefined}
    >
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </Carousel>
  )
}
