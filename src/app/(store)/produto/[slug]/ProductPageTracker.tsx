'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/pixel'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

interface TrackerProps {
  product: {
    id: string
    name: string
    slug: string
    image: string
    price: number
  }
}

export default function ProductPageTracker({ product }: TrackerProps) {
  const { addProduct } = useRecentlyViewed()

  useEffect(() => {
    trackEvent('ViewContent', {
      content_name: product.name,
      content_ids: [product.id],
      content_type: 'product',
      value: product.price,
      currency: 'BRL',
    })

    addProduct({
      id: product.id,
      name: product.name,
      slug: product.slug,
      image: product.image,
      price: product.price,
    })
  }, [product.id]) // eslint-disable-line react-hooks/exhaustive-deps

  return null
}
