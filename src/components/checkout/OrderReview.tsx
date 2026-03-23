'use client'

import Image from 'next/image'
import { formatPrice } from '@/lib/utils'
import type { CartItem } from '@/types'

interface OrderReviewProps {
  items: CartItem[]
  subtotal: number
  shippingCost: number
  shippingMethod: string
  discount: number
  couponCode?: string
}

export default function OrderReview({
  items,
  subtotal,
  shippingCost,
  discount,
  shippingMethod,
  couponCode,
}: OrderReviewProps) {
  const total = subtotal - discount + shippingCost

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Resumo do Pedido</h2>

      <div className="space-y-3">
        {items.map((item) => (
          <div key={`${item.productId}-${item.variationId}`} className="flex gap-3 items-center">
            <div className="relative w-12 h-12 flex-shrink-0 rounded-lg overflow-hidden bg-stone-100">
              <Image
                src={item.image}
                alt={item.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-800 truncate">{item.name}</p>
              {item.variationName && (
                <p className="text-xs text-stone-500">{item.variationName}</p>
              )}
              <p className="text-xs text-stone-500">{item.quantity}x {formatPrice(item.price)}</p>
            </div>
            <span className="text-sm font-medium text-stone-800">
              {formatPrice(item.price * item.quantity)}
            </span>
          </div>
        ))}
      </div>

      <div className="border-t border-stone-200 pt-3 space-y-2 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>
        <div className="flex justify-between text-stone-600">
          <span>Frete ({shippingMethod})</span>
          <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
        </div>
        {discount > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Desconto{couponCode ? ` (${couponCode})` : ''}</span>
            <span>-{formatPrice(discount)}</span>
          </div>
        )}
        <div className="border-t border-stone-300 pt-2 flex justify-between font-semibold text-stone-800 text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>
    </div>
  )
}
