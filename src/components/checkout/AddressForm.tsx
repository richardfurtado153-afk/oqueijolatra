'use client'

import { useState } from 'react'
import { formatCep } from '@/lib/utils'

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

const STATES = [
  'AC','AL','AP','AM','BA','CE','DF','ES','GO','MA',
  'MT','MS','MG','PA','PB','PR','PE','PI','RJ','RN',
  'RS','RO','RR','SC','SP','SE','TO'
]

const inputBase = 'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors'
const inputNormal = `${inputBase} border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600`
const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500`

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
  const [cepError, setCepError] = useState('')
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const fetchAddress = async (cepValue: string) => {
    const clean = cepValue.replace(/\D/g, '')
    if (clean.length !== 8) return
    setLoadingCep(true)
    setCepError('')
    try {
      const res = await fetch(`https://viacep.com.br/ws/${clean}/json/`)
      const data = await res.json()
      if (data.erro) {
        setCepError('CEP nao encontrado')
      } else {
        setStreet(data.logradouro || '')
        setNeighborhood(data.bairro || '')
        setCity(data.localidade || '')
        setState(data.uf || '')
        setCepError('')
      }
    } catch {
      setCepError('Erro ao buscar CEP. Tente novamente.')
    } finally {
      setLoadingCep(false)
    }
  }

  function handleCepChange(e: React.ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value)
    setCep(formatted)
    setCepError('')
    const clean = formatted.replace(/\D/g, '')
    if (clean.length === 8) {
      fetchAddress(clean)
    }
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-stone-800">Endereco de Entrega</legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="checkout-cep" className="block text-sm font-medium text-stone-700 mb-1">
            CEP <span className="text-red-500">*</span>
          </label>
          <div className="relative">
            <input
              id="checkout-cep"
              type="text"
              value={cep}
              onChange={handleCepChange}
              onBlur={() => markTouched('cep')}
              placeholder="00000-000"
              maxLength={9}
              required
              inputMode="numeric"
              autoComplete="postal-code"
              aria-invalid={!!cepError}
              aria-describedby={cepError ? 'cep-error' : loadingCep ? 'cep-loading' : undefined}
              className={cepError ? inputError : inputNormal}
            />
            {loadingCep && (
              <div className="absolute right-3 top-1/2 -translate-y-1/2">
                <svg className="animate-spin h-4 w-4 text-amber-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
              </div>
            )}
          </div>
          {loadingCep && <p id="cep-loading" className="text-xs text-amber-600 mt-1">Buscando endereco...</p>}
          {cepError && <p id="cep-error" className="text-xs text-red-600 mt-1" role="alert">{cepError}</p>}
          {touched.cep && !cepError && cep.replace(/\D/g, '').length > 0 && cep.replace(/\D/g, '').length < 8 && (
            <p className="text-xs text-red-600 mt-1" role="alert">CEP deve ter 8 digitos</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="checkout-street" className="block text-sm font-medium text-stone-700 mb-1">
            Rua <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-street"
            type="text"
            value={street}
            onChange={(e) => setStreet(e.target.value)}
            onBlur={() => markTouched('street')}
            required
            autoComplete="street-address"
            aria-invalid={touched.street && !street.trim()}
            className={touched.street && !street.trim() ? inputError : inputNormal}
          />
          {touched.street && !street.trim() && <p className="text-xs text-red-600 mt-1" role="alert">Informe a rua</p>}
        </div>

        <div>
          <label htmlFor="checkout-number" className="block text-sm font-medium text-stone-700 mb-1">
            Numero <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-number"
            type="text"
            value={number}
            onChange={(e) => setNumber(e.target.value)}
            onBlur={() => markTouched('number')}
            required
            className={touched.number && !number.trim() ? inputError : inputNormal}
          />
          {touched.number && !number.trim() && <p className="text-xs text-red-600 mt-1" role="alert">Informe o numero</p>}
        </div>

        <div>
          <label htmlFor="checkout-complement" className="block text-sm font-medium text-stone-700 mb-1">
            Complemento <span className="text-xs text-stone-400 font-normal">(opcional)</span>
          </label>
          <input
            id="checkout-complement"
            type="text"
            value={complement}
            onChange={(e) => setComplement(e.target.value)}
            placeholder="Apto, Bloco, etc."
            className={inputNormal}
          />
        </div>

        <div>
          <label htmlFor="checkout-neighborhood" className="block text-sm font-medium text-stone-700 mb-1">
            Bairro <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-neighborhood"
            type="text"
            value={neighborhood}
            onChange={(e) => setNeighborhood(e.target.value)}
            onBlur={() => markTouched('neighborhood')}
            required
            className={touched.neighborhood && !neighborhood.trim() ? inputError : inputNormal}
          />
          {touched.neighborhood && !neighborhood.trim() && <p className="text-xs text-red-600 mt-1" role="alert">Informe o bairro</p>}
        </div>

        <div>
          <label htmlFor="checkout-city" className="block text-sm font-medium text-stone-700 mb-1">
            Cidade <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-city"
            type="text"
            value={city}
            onChange={(e) => setCity(e.target.value)}
            onBlur={() => markTouched('city')}
            required
            autoComplete="address-level2"
            className={touched.city && !city.trim() ? inputError : inputNormal}
          />
          {touched.city && !city.trim() && <p className="text-xs text-red-600 mt-1" role="alert">Informe a cidade</p>}
        </div>

        <div>
          <label htmlFor="checkout-state" className="block text-sm font-medium text-stone-700 mb-1">
            Estado <span className="text-red-500">*</span>
          </label>
          <select
            id="checkout-state"
            value={state}
            onChange={(e) => setState(e.target.value)}
            onBlur={() => markTouched('state')}
            required
            autoComplete="address-level1"
            className={touched.state && !state ? inputError : inputNormal}
          >
            <option value="">Selecione</option>
            {STATES.map((uf) => (
              <option key={uf} value={uf}>{uf}</option>
            ))}
          </select>
          {touched.state && !state && <p className="text-xs text-red-600 mt-1" role="alert">Selecione o estado</p>}
        </div>
      </div>
    </fieldset>
  )
}
