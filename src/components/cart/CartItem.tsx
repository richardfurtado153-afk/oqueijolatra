'use client'

import Image from 'next/image'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import QuantitySelector from '@/components/product/QuantitySelector'
import type { CartItem as CartItemType } from '@/types'

interface CartItemProps {
  item: CartItemType
}

export default function CartItem({ item }: CartItemProps) {
  const updateQuantity = useCartStore((s) => s.updateQuantity)
  const removeItem = useCartStore((s) => s.removeItem)

  const lineTotal = item.price * item.quantity

  return (
    <div className="flex gap-4 py-4 border-b border-stone-200">
      <div className="relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
        <Image
          src={item.image}
          alt={item.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div>
            <h3 className="text-sm font-medium text-stone-800 truncate">
              {item.name}
            </h3>
            {item.variationName && (
              <p className="text-xs text-stone-500 mt-0.5">{item.variationName}</p>
            )}
            <p className="text-sm text-stone-600 mt-1">{formatPrice(item.price)}</p>
          </div>
          <button
            type="button"
            onClick={() => removeItem(item.productId, item.variationId)}
            className="p-1 text-stone-400 hover:text-red-600 transition-colors"
            aria-label={`Remover ${item.name}`}
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>
        </div>

        <div className="flex items-center justify-between mt-3">
          <QuantitySelector
            value={item.quantity}
            onChange={(qty) => updateQuantity(item.productId, item.variationId, qty)}
            min={1}
          />
          <span className="text-sm font-semibold text-stone-800">
            {formatPrice(lineTotal)}
          </span>
        </div>
      </div>
    </div>
  )
}
