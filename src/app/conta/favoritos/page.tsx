'use client'

import { useState, useEffect } from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import { toCardData } from '@/lib/utils'
import type { PrismaProductWithImages } from '@/types'

interface FavoriteItem {
  id: string
  productId: string
  product: PrismaProductWithImages
}

export default function FavoritesPage() {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFavorites()
  }, [])

  async function fetchFavorites() {
    try {
      const res = await fetch('/api/favorites')
      if (res.ok) {
        const data = await res.json()
        setFavorites(data)
      }
    } catch {
      // silently fail
    } finally {
      setLoading(false)
    }
  }

  async function removeFavorite(productId: string) {
    try {
      const res = await fetch('/api/favorites', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ productId }),
      })
      if (res.ok) {
        setFavorites((prev) => prev.filter((f) => f.product.id !== productId))
      }
    } catch {
      // silently fail
    }
  }

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-stone-900 mb-6">Favoritos</h1>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white rounded-xl shadow-sm overflow-hidden animate-pulse">
              <div className="w-full aspect-square bg-stone-200" />
              <div className="p-3 space-y-2">
                <div className="h-4 bg-stone-200 rounded w-full" />
                <div className="h-4 bg-stone-200 rounded w-2/3" />
                <div className="h-6 bg-stone-200 rounded w-1/2" />
              </div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Favoritos</h1>

      {favorites.length === 0 ? (
        <div className="text-center py-16">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16 mx-auto text-stone-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
          </svg>
          <p className="text-lg font-medium text-stone-600 mb-1">Nenhum favorito ainda</p>
          <p className="text-sm text-stone-400 mb-4">Explore nossos produtos e salve seus favoritos.</p>
          <a href="/" className="inline-block bg-amber-600 text-white font-semibold px-6 py-2.5 rounded-lg hover:bg-amber-700 transition-colors">
            Explorar produtos
          </a>
        </div>
      ) : (
        <div>
          <div className="flex flex-wrap gap-2 mb-4">
            {favorites.map((fav) => (
              <button
                key={fav.id}
                onClick={() => removeFavorite(fav.product.id)}
                className="text-xs text-red-600 hover:text-red-700 bg-red-50 px-2 py-1 rounded"
              >
                Remover {fav.product.name}
              </button>
            ))}
          </div>
          <ProductGrid products={favorites.map((fav) => toCardData(fav.product))} />
        </div>
      )}
    </div>
  )
}
