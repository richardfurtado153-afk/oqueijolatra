'use client'

import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { formatPrice, calcDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  image: string
}

interface ProductCardProps {
  product: ProductCardData
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)

  const discount =
    product.compareAtPrice && product.compareAtPrice > product.price
      ? calcDiscountPercent(product.compareAtPrice, product.price)
      : null

  function handleAddToCart() {
    addItem({
      productId: product.id,
      variationId: null,
      name: product.name,
      variationName: null,
      image: product.image,
      price: product.price,
    })
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-shadow flex-shrink-0 w-[220px] snap-start overflow-hidden group">
      <div className="relative w-full aspect-square">
        {discount && <Badge percentage={discount} />}
        <Link href={`/produto/${product.slug}`}>
          <Image
            src={product.image}
            alt={product.name}
            fill
            className="object-cover"
            sizes="220px"
          />
        </Link>
      </div>

      <div className="p-3 flex flex-col gap-2">
        <Link href={`/produto/${product.slug}`}>
          <h3 className="text-sm font-medium text-stone-800 line-clamp-2 leading-tight hover:text-amber-700 transition-colors">
            {product.name}
          </h3>
        </Link>

        <div className="flex flex-col">
          {product.compareAtPrice && product.compareAtPrice > product.price && (
            <span className="text-xs text-stone-400 line-through">
              De {formatPrice(product.compareAtPrice)}
            </span>
          )}
          <span className="text-lg font-bold text-stone-900">
            {product.compareAtPrice && product.compareAtPrice > product.price && (
              <span className="text-xs font-normal text-stone-500 mr-1">Por</span>
            )}
            {formatPrice(product.price)}
          </span>
        </div>

        <div className="flex flex-col gap-1.5 mt-auto">
          <button
            onClick={handleAddToCart}
            className="w-full bg-amber-600 text-white text-sm font-semibold py-2 rounded-lg hover:bg-amber-700 transition-colors"
          >
            Comprar
          </button>
          <Link
            href={`/produto/${product.slug}`}
            className="text-center text-xs text-stone-500 hover:text-amber-700 transition-colors"
          >
            Ver detalhes
          </Link>
        </div>
      </div>
    </div>
  )
}
