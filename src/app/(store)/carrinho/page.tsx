'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useCartStore } from '@/stores/cart'
import CartItem from '@/components/cart/CartItem'
import CartSummary from '@/components/cart/CartSummary'
import CouponInput from '@/components/cart/CouponInput'
import ShippingCalculator from '@/components/product/ShippingCalculator'

interface AppliedCoupon {
  code: string
  type: string
  discount: number
}

export default function CarrinhoPage() {
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const [appliedCoupon, setAppliedCoupon] = useState<AppliedCoupon | null>(null)

  const subtotal = getSubtotal()

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="space-y-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="w-16 h-16 mx-auto text-stone-300"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-stone-800">Seu carrinho esta vazio</h1>
          <p className="text-stone-500">Explore nossos produtos e adicione itens ao carrinho.</p>
          <Link
            href="/"
            className="inline-block mt-4 px-6 py-3 bg-amber-600 text-white font-semibold rounded-lg hover:bg-amber-700 transition-colors"
          >
            Continuar Comprando
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-0">
          {items.map((item) => (
            <CartItem
              key={`${item.productId}-${item.variationId}`}
              item={item}
            />
          ))}

          <div className="pt-6 space-y-6">
            <CouponInput
              orderValue={subtotal}
              onApply={setAppliedCoupon}
              appliedCoupon={appliedCoupon}
            />
            <ShippingCalculator />
          </div>
        </div>

        <div>
          <CartSummary
            subtotal={subtotal}
            discount={appliedCoupon?.discount}
          />
        </div>
      </div>
    </div>
  )
}
