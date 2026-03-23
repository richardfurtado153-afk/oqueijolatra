'use client'

import { useState } from 'react'
import { formatPrice } from '@/lib/utils'

interface AppliedCoupon {
  code: string
  type: string
  discount: number
}

interface CouponInputProps {
  orderValue: number
  onApply: (coupon: AppliedCoupon | null) => void
  appliedCoupon: AppliedCoupon | null
}

export default function CouponInput({ orderValue, onApply, appliedCoupon }: CouponInputProps) {
  const [code, setCode] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  async function handleApply() {
    const trimmed = code.trim()
    if (!trimmed) return

    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: trimmed, orderValue }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Cupom invalido')
        onApply(null)
      } else {
        onApply(data)
        setError('')
      }
    } catch {
      setError('Erro ao validar cupom')
      onApply(null)
    } finally {
      setLoading(false)
    }
  }

  function handleRemove() {
    onApply(null)
    setCode('')
    setError('')
  }

  if (appliedCoupon) {
    return (
      <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
        <div className="text-sm">
          <span className="font-medium text-green-800">Cupom {appliedCoupon.code}</span>
          <span className="text-green-700 ml-2">-{formatPrice(appliedCoupon.discount)}</span>
        </div>
        <button
          type="button"
          onClick={handleRemove}
          className="text-sm text-red-600 hover:text-red-700 font-medium"
        >
          Remover
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-2">
        <input
          type="text"
          value={code}
          onChange={(e) => setCode(e.target.value.toUpperCase())}
          placeholder="Codigo do cupom"
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        <button
          type="button"
          onClick={handleApply}
          disabled={loading || !code.trim()}
          className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Validando...' : 'Aplicar'}
        </button>
      </div>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
