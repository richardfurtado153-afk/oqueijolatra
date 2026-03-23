'use client'

import { useState } from 'react'

interface AddressFormProps {
  cep: string
  setCep: (v: string) => void
  street: string
  setStreet: (v: string) => void
  number: string
  setNumber: (v: string) => void
  complement: string
  setComplement: (v: string) => void
  neighborhood: string
  setNeighborhood: (v: string) => void
  city: string
  setCity: (v: string) => void
  state: string
  setState: (v: string) => void
}

function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  return digits
}

export default function AddressForm({
  cep, setCep,
  street, setStreet,
  number, setNumber,
  complement, setComplement,
  neighborhood, setNeighborhood,
  city, setCity,
  state, setState,
}: AddressFormProps) {
  const [loadingCep, setLoadingCep] = useState(false)

  const fetchAddress = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setStreet(data.logradouro)
        setNeighborhood(data.bairro)
        setCity(data.localidade)
        setState(data.uf)
      }
    } catch {
      // silently fail
    } finally {
      setLoadingCep(false)
    }
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
    const clean = formatted.replace(/\D/g, '')
    if (clean.length === 8) {
      fetchAddress(clean)
    }
  }

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Endereco de Entrega</h2>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="cep" className="block text-sm font-medium text-stone-700 mb-1">
            CEP
          </label>
          <input
            id="cep"
            type="text"
            value={cep}
            onChange={handleCepChange}
            placeholder="00000-000"
            maxLength={9}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
          {loadingCep && <p className="text-xs text-amber-600 mt-1">Buscando endereco...</p>}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="street" className="block text-sm font-medium text-stone-700 mb-1">
            Rua
          </label>
          <input
            id="street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label htmlFor="number" className="block text-sm font-medium text-stone-700 mb-1">
            Numero
          </label>
          <input
            id="number"
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label htmlFor="complement" className="block text-sm font-medium text-stone-700 mb-1">
            Complemento
          </label>
          <input
            id="complement"
            type="text"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apto, Bloco, etc."
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label htmlFor="neighborhood" className="block text-sm font-medium text-stone-700 mb-1">
            Bairro
          </label>
          <input
            id="neighborhood"
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label htmlFor="city" className="block text-sm font-medium text-stone-700 mb-1">
            Cidade
          </label>
          <input
            id="city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>

        <div>
          <label htmlFor="state" className="block text-sm font-medium text-stone-700 mb-1">
            Estado
          </label>
          <input
            id="state"
            type="text"
            value={state}
            onChange={(e) => setState(e.target.value.toUpperCase().slice(0, 2))}
            placeholder="UF"
            maxLength={2}
            required
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
          />
        </div>
      </div>
    </div>
  )
}
