'use client'

import { useEffect } from 'react'
import { trackEvent } from '@/lib/pixel'

interface PurchaseTrackerProps {
  orderNumber: number
  total: number
}

export default function PurchaseTracker({ orderNumber, total }: PurchaseTrackerProps) {
  useEffect(() => {
    trackEvent('Purchase', {
      value: total,
      currency: 'BRL',
      content_name: `Pedido #${orderNumber}`,
    })
  }, [orderNumber, total])

  return null
}
