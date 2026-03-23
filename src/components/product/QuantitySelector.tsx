'use client'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
}

export default function QuantitySelector({
  value,
  onChange,
  min = 1,
  max,
}: QuantitySelectorProps) {
  function decrement() {
    if (value > min) onChange(value - 1)
  }

  function increment() {
    if (max === undefined || value < max) onChange(value + 1)
  }

  function handleInputChange(e: React.ChangeEvent<HTMLInputElement>) {
    const num = parseInt(e.target.value, 10)
    if (isNaN(num)) return
    if (num < min) {
      onChange(min)
    } else if (max !== undefined && num > max) {
      onChange(max)
    } else {
      onChange(num)
    }
  }

  return (
    <div className="flex items-center border border-stone-300 rounded-lg overflow-hidden w-fit">
      <button
        type="button"
        onClick={decrement}
        disabled={value <= min}
        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Diminuir quantidade"
      >
        -
      </button>
      <input
        type="number"
        value={value}
        onChange={handleInputChange}
        min={min}
        max={max}
        className="w-12 h-10 text-center text-sm font-medium text-stone-800 border-x border-stone-300 outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      />
      <button
        type="button"
        onClick={increment}
        disabled={max !== undefined && value >= max}
        className="w-10 h-10 flex items-center justify-center text-stone-600 hover:bg-stone-100 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        aria-label="Aumentar quantidade"
      >
        +
      </button>
    </div>
  )
}
