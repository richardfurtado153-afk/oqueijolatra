'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import { useToastStore } from '@/stores/toast'
import { formatPrice, calcDiscountPercent } from '@/lib/utils'
import QuantitySelector from './QuantitySelector'
import FavoriteButton from '@/components/account/FavoriteButton'

interface Variation {
  id: string
  name: string
  sku: string
  price: number
  compareAtPrice: number | null
  stock: number
}

interface ProductInfoProps {
  product: {
    id: string
    name: string
    slug: string
    sku: string
    price: number
    compareAtPrice: number | null
    stock: number
    status: string
    image: string
  }
  brand: { name: string; slug: string } | null
  variations: Variation[]
  initialFavorited?: boolean
}

export default function ProductInfo({
  product,
  brand,
  variations,
  initialFavorited = false,
}: ProductInfoProps) {
  const addItem = useCartStore((s) => s.addItem)
  const addToast = useToastStore((s) => s.addToast)
  const [selectedVariation, setSelectedVariation] = useState<Variation | null>(
    variations.length > 0 ? variations[0] : null
  )
  const [quantity, setQuantity] = useState(1)

  const activePrice = selectedVariation ? selectedVariation.price : product.price
  const activeCompareAt = selectedVariation
    ? selectedVariation.compareAtPrice
    : product.compareAtPrice
  const activeStock = selectedVariation ? selectedVariation.stock : product.stock
  const activeSku = selectedVariation ? selectedVariation.sku : product.sku
  const isAvailable = product.status === 'AVAILABLE' && activeStock > 0

  const discount =
    activeCompareAt && activeCompareAt > activePrice
      ? calcDiscountPercent(activeCompareAt, activePrice)
      : null

  const installmentPrice = activePrice / 3

  function handleAddToCart() {
    addItem(
      {
        productId: product.id,
        variationId: selectedVariation?.id ?? null,
        name: product.name,
        variationName: selectedVariation?.name ?? null,
        image: product.image,
        price: activePrice,
      },
      quantity
    )
    addToast('Produto adicionado ao carrinho!')
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-start justify-between gap-2">
        <h1 className="text-2xl font-bold text-stone-900 leading-tight">
          {product.name}
        </h1>
        <FavoriteButton productId={product.id} initialFavorited={initialFavorited} />
      </div>

      <div className="flex items-center gap-3 text-sm text-stone-500">
        <span>SKU: {activeSku}</span>
        {brand && (
          <>
            <span className="text-stone-300">|</span>
            <span>
              Marca:{' '}
              <Link
                href={`/marca/${brand.slug}`}
                className="text-amber-700 hover:underline"
              >
                {brand.name}
              </Link>
            </span>
          </>
        )}
      </div>

      {/* Price */}
      <div className="flex items-center gap-3 flex-wrap">
        {activeCompareAt && activeCompareAt > activePrice && (
          <span className="text-base text-stone-400 line-through">
            De {formatPrice(activeCompareAt)}
          </span>
        )}
        <span className="text-2xl font-bold text-amber-700">
          {activeCompareAt && activeCompareAt > activePrice && (
            <span className="text-sm font-normal text-stone-500 mr-1">Por</span>
          )}
          {formatPrice(activePrice)}
        </span>
        {discount && (
          <span className="bg-red-600 text-white text-xs font-bold px-2 py-1 rounded-md">
            -{discount}%
          </span>
        )}
      </div>

      {/* Payment info */}
      <div className="text-sm text-stone-600 space-y-1">
        <p>
          <span className="font-medium text-green-700">PIX</span> (mesmo preco)
        </p>
        <p>
          <span className="font-medium">Cartao</span> ate 3x de{' '}
          {formatPrice(installmentPrice)} sem juros
        </p>
      </div>

      {/* Variations */}
      {variations.length > 0 && (
        <div className="space-y-2">
          <label className="text-sm font-medium text-stone-700">Variacao:</label>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => (
              <button
                key={v.id}
                type="button"
                onClick={() => {
                  setSelectedVariation(v)
                  setQuantity(1)
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-colors ${
                  selectedVariation?.id === v.id
                    ? 'border-amber-600 bg-amber-50 text-amber-800 font-medium'
                    : 'border-stone-300 text-stone-700 hover:border-stone-400'
                } ${v.stock <= 0 ? 'opacity-40 cursor-not-allowed' : ''}`}
                disabled={v.stock <= 0}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock status */}
      <div>
        {isAvailable ? (
          <span className="text-sm font-medium text-green-600">Disponivel</span>
        ) : (
          <span className="text-sm font-medium text-red-600">Indisponivel</span>
        )}
      </div>

      {/* Quantity + Add to cart */}
      {isAvailable && (
        <div className="flex items-center gap-4 flex-wrap">
          <QuantitySelector
            value={quantity}
            onChange={setQuantity}
            min={1}
            max={activeStock}
          />
          <button
            onClick={handleAddToCart}
            className="flex-1 min-w-[160px] bg-amber-700 text-white font-semibold py-3 px-6 rounded-lg hover:bg-amber-800 transition-colors text-center"
          >
            Comprar
          </button>
        </div>
      )}
    </div>
  )
}
