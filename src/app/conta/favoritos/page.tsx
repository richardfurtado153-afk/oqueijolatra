'use client'

import { useState, useEffect } from 'react'
import ProductGrid from '@/components/product/ProductGrid'
import { type ProductCardData } from '@/components/product/ProductCard'

interface FavoriteItem {
  id: string
  productId: string
  product: {
    id: string
    name: string
    slug: string
    price: number | { toNumber?: () => number }
    compareAtPrice: number | { toNumber?: () => number } | null
    images: { url: string; isMain: boolean }[]
  }
}

function toCardData(fav: FavoriteItem): ProductCardData {
  const price =
    typeof fav.product.price === 'number' ? fav.product.price : Number(fav.product.price)
  const compareAtPrice = fav.product.compareAtPrice
    ? typeof fav.product.compareAtPrice === 'number'
      ? fav.product.compareAtPrice
      : Number(fav.product.compareAtPrice)
    : null
  const mainImage = fav.product.images.find((i) => i.isMain) || fav.product.images[0]
  return {
    id: fav.product.id,
    name: fav.product.name,
    slug: fav.product.slug,
    price,
    compareAtPrice,
    image: mainImage?.url || '/placeholder.jpg',
  }
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
        <p className="text-stone-500">Carregando...</p>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Favoritos</h1>

      {favorites.length === 0 ? (
        <p className="text-stone-500 text-center py-16">
          Voce ainda nao tem produtos favoritos.
        </p>
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
          <ProductGrid products={favorites.map(toCardData)} />
        </div>
      )}
    </div>
  )
}
