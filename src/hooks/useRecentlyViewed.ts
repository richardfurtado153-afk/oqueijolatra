'use client'

import { useState, useEffect, useCallback } from 'react'

interface RecentProduct {
  id: string
  name: string
  slug: string
  image: string
  price: number
}

const STORAGE_KEY = 'queijolatra-recently-viewed'
const MAX_ITEMS = 10

export function useRecentlyViewed() {
  const [items, setItems] = useState<RecentProduct[]>([])

  useEffect(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      if (stored) {
        setItems(JSON.parse(stored))
      }
    } catch {
      // ignore parse errors
    }
  }, [])

  const addProduct = useCallback((product: RecentProduct) => {
    setItems((prev) => {
      const filtered = prev.filter((p) => p.id !== product.id)
      const updated = [product, ...filtered].slice(0, MAX_ITEMS)
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(updated))
      } catch {
        // ignore storage errors
      }
      return updated
    })
  }, [])

  return { items, addProduct }
}
