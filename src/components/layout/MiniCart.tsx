'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useCartStore } from '@/stores/cart'

export default function MiniCart() {
  const [open, setOpen] = useState(false)
  const items = useCartStore((s) => s.items)
  const getItemCount = useCartStore((s) => s.getItemCount)
  const getSubtotal = useCartStore((s) => s.getSubtotal)

  const count = getItemCount()
  const subtotal = getSubtotal()

  return (
    <div className="relative" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center gap-1 text-stone-700 hover:text-amber-700 transition-colors p-2"
        aria-label="Carrinho"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
        </svg>
        {count > 0 && (
          <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-xs font-bold w-5 h-5 rounded-full flex items-center justify-center">
            {count > 99 ? '99+' : count}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 w-80 bg-white border border-stone-200 rounded-xl shadow-xl z-50">
          {items.length === 0 ? (
            <p className="p-6 text-center text-sm text-stone-500">Seu carrinho esta vazio</p>
          ) : (
            <>
              <div className="max-h-64 overflow-y-auto p-4 space-y-3">
                {items.map((item) => (
                  <div key={`${item.productId}-${item.variationId}`} className="flex items-center gap-3">
                    <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-stone-100">
                      <Image src={item.image} alt={item.name} fill className="object-cover" sizes="48px" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm text-stone-800 font-medium truncate">{item.name}</p>
                      {item.variationName && (
                        <p className="text-xs text-stone-500">{item.variationName}</p>
                      )}
                      <p className="text-xs text-stone-500">
                        {item.quantity}x{' '}
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="border-t border-stone-200 p-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-sm font-medium text-stone-600">Subtotal</span>
                  <span className="text-base font-bold text-stone-800">
                    {subtotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
                <Link
                  href="/carrinho"
                  className="block w-full text-center bg-amber-700 text-white py-2.5 rounded-lg text-sm font-medium hover:bg-amber-800 transition-colors"
                >
                  Ver Carrinho
                </Link>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
