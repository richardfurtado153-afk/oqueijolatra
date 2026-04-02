'use client'

import React from 'react'
import Image from 'next/image'
import Link from 'next/link'
import Badge from '@/components/ui/Badge'
import { formatPrice, calcDiscountPercent } from '@/lib/utils'
import { useCartStore } from '@/stores/cart'
import type { ProductCardData } from '@/types'

export type { ProductCardData }

interface ProductCardProps {
  product: ProductCardData
}

export function ProductCardSkeleton() {
  return (
    <div className="relative bg-white rounded-xl shadow-sm flex-shrink-0 w-[220px] snap-start overflow-hidden animate-pulse">
      <div className="w-full aspect-square bg-stone-200" />
      <div className="p-3 flex flex-col gap-2">
        <div className="h-4 bg-stone-200 rounded w-full" />
        <div className="h-4 bg-stone-200 rounded w-2/3" />
        <div className="h-6 bg-stone-200 rounded w-1/2 mt-1" />
        <div className="h-9 bg-stone-200 rounded w-full mt-1" />
      </div>
    </div>
  )
}

export default function ProductCard({ product }: ProductCardProps) {
  const addItem = useCartStore((s) => s.addItem)
  const [imgError, setImgError] = React.useState(false)
  const [added, setAdded] = React.useState(false)

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
    setAdded(true)
    setTimeout(() => setAdded(false), 1500)
  }

  return (
    <div className="relative bg-white rounded-xl shadow-sm hover:shadow-md transition-all duration-200 flex-shrink-0 w-[220px] snap-start overflow-hidden group">
      <div className="relative w-full aspect-square">
        {discount && <Badge percentage={discount} />}
        <Link
          href={`/produto/${product.slug}`}
          className="relative block w-full h-full"
          aria-label={`Ver ${product.name}`}
        >
          {imgError ? (
            <div className="absolute inset-0 bg-stone-100 flex items-center justify-center text-stone-300 text-5xl">
              <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          ) : (
            <Image
              src={product.image}
              alt={product.name}
              fill
              className="object-cover group-hover:scale-105 transition-transform duration-300"
              sizes="220px"
              unoptimized
              onError={() => setImgError(true)}
            />
          )}
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
            aria-label={`Adicionar ${product.name} ao carrinho`}
            className={`w-full text-white text-sm font-semibold py-2 rounded-lg transition-all duration-200 ${
              added
                ? 'bg-green-600 scale-95'
                : 'bg-amber-600 hover:bg-amber-700 active:scale-95'
            }`}
          >
            {added ? 'Adicionado!' : 'Comprar'}
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
