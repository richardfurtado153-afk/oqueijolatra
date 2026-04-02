'use client'

import { useState } from 'react'
import { formatPrice, formatCep } from '@/lib/utils'
import type { ShippingOption } from '@/types'

export default function ShippingCalculator() {
  const [cep, setCep] = useState('')
  const [loading, setLoading] = useState(false)
  const [options, setOptions] = useState<ShippingOption[]>([])
  const [error, setError] = useState('')

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    setCep(formatCep(e.target.value))
  }

  async function handleCalculate() {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) {
      setError('CEP deve ter 8 digitos')
      return
    }

    setError('')
    setLoading(true)
    setOptions([])

    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: digits }),
      })
      const data = await res.json()
      if (!res.ok) {
        setError(data.error || 'Erro ao calcular frete')
      } else {
        setOptions(data.options)
      }
    } catch {
      setError('Erro ao calcular frete')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-stone-700 uppercase tracking-wide">
        Calcular Frete
      </h3>

      <div className="flex gap-2">
        <input
          type="text"
          value={cep}
          onChange={handleCepChange}
          placeholder="00000-000"
          maxLength={9}
          className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
        />
        <button
          type="button"
          onClick={handleCalculate}
          disabled={loading}
          className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
        >
          {loading ? 'Calculando...' : 'Calcular'}
        </button>
      </div>

      <a
        href="https://buscacepinter.correios.com.br/app/endereco/index.php"
        target="_blank"
        rel="noopener noreferrer"
        className="text-xs text-amber-700 hover:underline"
      >
        Nao sei meu CEP
      </a>

      {error && <p className="text-sm text-red-600">{error}</p>}

      {options.length > 0 && (
        <div className="space-y-2">
          {options.map((opt) => (
            <div
              key={opt.method}
              className="flex items-center justify-between bg-stone-50 rounded-lg p-3 text-sm"
            >
              <div>
                <span className="font-medium text-stone-800">{opt.method}</span>
                <span className="text-stone-500 ml-2">
                  {opt.days} {opt.days === 1 ? 'dia util' : 'dias uteis'}
                </span>
              </div>
              <span className="font-semibold text-stone-800">
                {opt.price === 0 ? 'Gratis' : formatPrice(opt.price)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
