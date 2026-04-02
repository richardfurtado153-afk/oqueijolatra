'use client'

import type { ProductCardData } from '@/types'
import ProductCard from './ProductCard'

interface RelatedProductsProps {
  products: ProductCardData[]
}

export default function RelatedProducts({ products }: RelatedProductsProps) {
  if (products.length === 0) return null

  return (
    <section>
      <h2 className="text-xl font-bold text-stone-900 mb-4">Produtos Relacionados</h2>
      <div className="flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  )
}
