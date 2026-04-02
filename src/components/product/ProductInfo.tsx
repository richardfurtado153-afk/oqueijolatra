'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
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

  const [added, setAdded] = useState(false)

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
    setAdded(true)
    setTimeout(() => setAdded(false), 2000)
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
        <div className="space-y-2" role="radiogroup" aria-label="Variacao do produto">
          <span className="text-sm font-medium text-stone-700">Variacao:</span>
          <div className="flex flex-wrap gap-2">
            {variations.map((v) => (
              <button
                key={v.id}
                type="button"
                role="radio"
                aria-checked={selectedVariation?.id === v.id}
                aria-label={`${v.name}${v.stock <= 0 ? ' - Indisponivel' : ''}`}
                onClick={() => {
                  setSelectedVariation(v)
                  setQuantity(1)
                  setAdded(false)
                }}
                className={`px-4 py-2 text-sm rounded-lg border transition-all duration-200 ${
                  selectedVariation?.id === v.id
                    ? 'border-amber-600 bg-amber-50 text-amber-800 font-medium ring-1 ring-amber-600'
                    : 'border-stone-300 text-stone-700 hover:border-stone-400'
                } ${v.stock <= 0 ? 'opacity-40 cursor-not-allowed line-through' : ''}`}
                disabled={v.stock <= 0}
              >
                {v.name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Stock status */}
      <div aria-live="polite">
        {isAvailable ? (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500" aria-hidden="true" />
            <span className="text-sm font-medium text-green-600">Disponivel</span>
            {activeStock <= 5 && (
              <span className="text-xs text-amber-600 font-medium">
                ({activeStock} {activeStock === 1 ? 'restante' : 'restantes'})
              </span>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-red-500" aria-hidden="true" />
            <span className="text-sm font-medium text-red-600">Indisponivel</span>
          </div>
        )}
      </div>

      {/* Quantity + Add to cart */}
      {isAvailable && (
        <div className="space-y-3">
          <div className="flex items-center gap-4 flex-wrap">
            <QuantitySelector
              value={quantity}
              onChange={setQuantity}
              min={1}
              max={activeStock}
            />
            <button
              onClick={handleAddToCart}
              aria-label={`Adicionar ${quantity} ${quantity === 1 ? 'unidade' : 'unidades'} ao carrinho`}
              className={`flex-1 min-w-[160px] font-semibold py-3 px-6 rounded-lg transition-all duration-200 text-center ${
                added
                  ? 'bg-green-600 text-white scale-[0.98]'
                  : 'bg-amber-700 text-white hover:bg-amber-800 active:scale-[0.98]'
              }`}
            >
              {added ? 'Adicionado ao carrinho!' : 'Comprar'}
            </button>
          </div>
          {added && (
            <p className="text-sm text-green-600 font-medium animate-[fade-in_0.3s_ease-out]" role="status">
              Produto adicionado ao carrinho com sucesso!
            </p>
          )}
        </div>
      )}
    </div>
  )
}
