'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

export default function RecentlyViewed() {
  const { items } = useRecentlyViewed()

  if (items.length === 0) return null

  return (
    <aside className="w-full">
      <h3 className="text-sm font-semibold text-stone-700 mb-3 uppercase tracking-wide">
        Vistos recentemente
      </h3>
      <div className="space-y-3">
        {items.slice(0, 5).map((product) => (
          <Link
            key={product.id}
            href={`/produto/${product.slug}`}
            className="flex items-center gap-3 p-2 rounded-lg hover:bg-stone-50 transition-colors"
          >
            <div className="relative w-12 h-12 flex-shrink-0 rounded-md overflow-hidden bg-stone-100">
              <Image
                src={product.image}
                alt={product.name}
                fill
                className="object-cover"
                sizes="48px"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-stone-800 font-medium truncate">{product.name}</p>
              <p className="text-sm text-amber-700 font-semibold">
                {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </aside>
  )
}
