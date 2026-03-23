'use client'

import Link from 'next/link'
import { formatPrice } from '@/lib/utils'

interface CartSummaryProps {
  subtotal: number
  shippingCost?: number
  discount?: number
}

export default function CartSummary({ subtotal, shippingCost, discount }: CartSummaryProps) {
  const discountValue = discount || 0
  const shippingValue = shippingCost ?? 0
  const total = subtotal - discountValue + shippingValue

  return (
    <div className="bg-stone-50 rounded-xl p-6 space-y-4">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
        Resumo do Pedido
      </h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between text-stone-600">
          <span>Subtotal</span>
          <span>{formatPrice(subtotal)}</span>
        </div>

        {shippingCost !== undefined && (
          <div className="flex justify-between text-stone-600">
            <span>Frete</span>
            <span>{shippingCost === 0 ? 'Gratis' : formatPrice(shippingCost)}</span>
          </div>
        )}

        {discountValue > 0 && (
          <div className="flex justify-between text-green-700">
            <span>Desconto</span>
            <span>-{formatPrice(discountValue)}</span>
          </div>
        )}

        <div className="border-t border-stone-300 pt-2 flex justify-between font-semibold text-stone-800 text-base">
          <span>Total</span>
          <span>{formatPrice(total)}</span>
        </div>
      </div>

      <Link
        href="/checkout"
        className="block w-full text-center py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
      >
        Finalizar Compra
      </Link>
    </div>
  )
}
