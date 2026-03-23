'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'

const PRICE_RANGES = [
  { label: 'R$25 - R$49', min: 25, max: 49 },
  { label: 'R$50 - R$69', min: 50, max: 69 },
  { label: 'R$70 - R$99', min: 70, max: 99 },
  { label: 'R$100 - R$199', min: 100, max: 199 },
  { label: 'R$200+', min: 200, max: undefined },
] as const

export default function PriceFilter() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeMin = searchParams.get('minPrice')
  const activeMax = searchParams.get('maxPrice')

  function handleSelect(min: number, max: number | undefined) {
    const params = new URLSearchParams(searchParams.toString())

    const isActive =
      activeMin === String(min) &&
      (max === undefined ? !activeMax : activeMax === String(max))

    if (isActive) {
      params.delete('minPrice')
      params.delete('maxPrice')
    } else {
      params.set('minPrice', String(min))
      if (max !== undefined) {
        params.set('maxPrice', String(max))
      } else {
        params.delete('maxPrice')
      }
    }

    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <div className="space-y-2">
      <h3 className="text-sm font-semibold text-stone-800">Preco</h3>
      <ul className="space-y-1">
        {PRICE_RANGES.map((range) => {
          const isActive =
            activeMin === String(range.min) &&
            (range.max === undefined
              ? !activeMax
              : activeMax === String(range.max))

          return (
            <li key={range.label}>
              <button
                onClick={() => handleSelect(range.min, range.max)}
                className={`w-full text-left text-sm px-2 py-1.5 rounded-md transition-colors ${
                  isActive
                    ? 'bg-amber-100 text-amber-800 font-medium'
                    : 'text-stone-600 hover:bg-stone-100'
                }`}
              >
                {range.label}
              </button>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
