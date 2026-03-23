'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import { useCartStore } from '@/stores/cart'
import { formatPrice } from '@/lib/utils'
import { trackEvent } from '@/lib/pixel'
import CustomerForm from '@/components/checkout/CustomerForm'
import AddressForm from '@/components/checkout/AddressForm'
import PaymentSelector from '@/components/checkout/PaymentSelector'
import OrderReview from '@/components/checkout/OrderReview'
import type { ShippingOption } from '@/types'

export default function CheckoutPage() {
  const router = useRouter()
  const { data: session } = useSession()
  const items = useCartStore((s) => s.items)
  const getSubtotal = useCartStore((s) => s.getSubtotal)
  const clearCart = useCartStore((s) => s.clearCart)

  // Customer
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [phone, setPhone] = useState('')
  const [cpf, setCpf] = useState('')

  // Address
  const [cep, setCep] = useState('')
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [complement, setComplement] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('')
  const [state, setState] = useState('')

  // Shipping
  const [shippingOptions, setShippingOptions] = useState<ShippingOption[]>([])
  const [selectedShipping, setSelectedShipping] = useState<ShippingOption | null>(null)
  const [loadingShipping, setLoadingShipping] = useState(false)

  // Payment
  const [paymentMethod, setPaymentMethod] = useState<'PIX' | 'CARD'>('PIX')

  // Coupon
  const [couponCode, setCouponCode] = useState('')
  const [discount, setDiscount] = useState(0)
  const [couponLoading, setCouponLoading] = useState(false)
  const [couponError, setCouponError] = useState('')
  const [couponApplied, setCouponApplied] = useState(false)

  // Submit
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')

  const subtotal = getSubtotal()

  // Pre-fill from session
  useEffect(() => {
    if (session?.user) {
      if (session.user.name) setName(session.user.name)
      if (session.user.email) setEmail(session.user.email)
    }
  }, [session])

  // Track InitiateCheckout
  useEffect(() => {
    trackEvent('InitiateCheckout', { value: subtotal, currency: 'BRL' })
  }, [])

  // Calculate shipping when CEP is complete
  async function handleCalculateShipping() {
    const digits = cep.replace(/\D/g, '')
    if (digits.length !== 8) return

    setLoadingShipping(true)
    setShippingOptions([])
    setSelectedShipping(null)

    try {
      const res = await fetch('/api/shipping/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ cep: digits }),
      })
      const data = await res.json()
      if (res.ok && data.options) {
        setShippingOptions(data.options)
        if (data.options.length > 0) {
          setSelectedShipping(data.options[0])
        }
      }
    } catch {
      // silently fail
    } finally {
      setLoadingShipping(false)
    }
  }

  // Coupon
  async function handleApplyCoupon() {
    if (!couponCode.trim()) return
    setCouponLoading(true)
    setCouponError('')

    try {
      const res = await fetch('/api/coupons/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode.trim(), orderValue: subtotal }),
      })
      const data = await res.json()
      if (!res.ok) {
        setCouponError(data.error || 'Cupom invalido')
        setDiscount(0)
        setCouponApplied(false)
      } else {
        setDiscount(data.discount)
        setCouponApplied(true)
        setCouponError('')
      }
    } catch {
      setCouponError('Erro ao validar cupom')
    } finally {
      setCouponLoading(false)
    }
  }

  function handleRemoveCoupon() {
    setCouponCode('')
    setDiscount(0)
    setCouponApplied(false)
    setCouponError('')
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (items.length === 0) {
      setError('Carrinho vazio')
      return
    }
    if (!selectedShipping) {
      setError('Selecione um metodo de envio')
      return
    }

    setSubmitting(true)

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: items.map((i) => ({
            productId: i.productId,
            variationId: i.variationId || undefined,
            quantity: i.quantity,
          })),
          customerName: name,
          email,
          phone: phone.replace(/\D/g, ''),
          cpf: cpf.replace(/\D/g, ''),
          shippingCep: cep.replace(/\D/g, ''),
          shippingStreet: street,
          shippingNumber: number,
          shippingComplement: complement || undefined,
          shippingNeighborhood: neighborhood,
          shippingCity: city,
          shippingState: state,
          shippingMethod: selectedShipping.method,
          shippingCost: selectedShipping.price,
          paymentMethod,
          couponCode: couponApplied ? couponCode.trim() : undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar pedido')
        return
      }

      clearCart()
      router.push(`/checkout/confirmacao?order=${data.order.orderNumber}`)
    } catch {
      setError('Erro ao processar pedido. Tente novamente.')
    } finally {
      setSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-800">Carrinho vazio</h1>
        <p className="text-stone-500 mt-2">Adicione produtos antes de finalizar a compra.</p>
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Checkout</h1>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Customer */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <CustomerForm
            name={name} setName={setName}
            email={email} setEmail={setEmail}
            phone={phone} setPhone={setPhone}
            cpf={cpf} setCpf={setCpf}
          />
        </div>

        {/* Address */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <AddressForm
            cep={cep} setCep={setCep}
            street={street} setStreet={setStreet}
            number={number} setNumber={setNumber}
            complement={complement} setComplement={setComplement}
            neighborhood={neighborhood} setNeighborhood={setNeighborhood}
            city={city} setCity={setCity}
            state={state} setState={setState}
          />
        </div>

        {/* Shipping */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Metodo de Envio</h2>

          <div className="flex gap-2">
            <button
              type="button"
              onClick={handleCalculateShipping}
              disabled={loadingShipping || cep.replace(/\D/g, '').length !== 8}
              className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
            >
              {loadingShipping ? 'Calculando...' : 'Calcular Frete'}
            </button>
          </div>

          {shippingOptions.length > 0 && (
            <div className="space-y-2">
              {shippingOptions.map((opt) => (
                <label
                  key={opt.method}
                  className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                    selectedShipping?.method === opt.method
                      ? 'border-amber-600 bg-amber-50'
                      : 'border-stone-300 hover:border-stone-400'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <input
                      type="radio"
                      name="shipping"
                      checked={selectedShipping?.method === opt.method}
                      onChange={() => setSelectedShipping(opt)}
                      className="accent-amber-600"
                    />
                    <div>
                      <span className="text-sm font-medium text-stone-800">{opt.method}</span>
                      <span className="text-xs text-stone-500 ml-2">
                        {opt.days} {opt.days === 1 ? 'dia util' : 'dias uteis'}
                      </span>
                    </div>
                  </div>
                  <span className="text-sm font-semibold text-stone-800">
                    {opt.price === 0 ? 'Gratis' : formatPrice(opt.price)}
                  </span>
                </label>
              ))}
            </div>
          )}
        </div>

        {/* Coupon */}
        <div className="bg-white border border-stone-200 rounded-xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-stone-800">Cupom de Desconto</h2>

          {couponApplied ? (
            <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg p-3">
              <div className="text-sm">
                <span className="font-medium text-green-800">Cupom {couponCode}</span>
                <span className="text-green-700 ml-2">-{formatPrice(discount)}</span>
              </div>
              <button
                type="button"
                onClick={handleRemoveCoupon}
                className="text-sm text-red-600 hover:text-red-700 font-medium"
              >
                Remover
              </button>
            </div>
          ) : (
            <div className="flex gap-2">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                placeholder="Codigo do cupom"
                className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600"
              />
              <button
                type="button"
                onClick={handleApplyCoupon}
                disabled={couponLoading || !couponCode.trim()}
                className="px-4 py-2 bg-stone-800 text-white text-sm font-medium rounded-lg hover:bg-stone-900 transition-colors disabled:opacity-50"
              >
                {couponLoading ? 'Validando...' : 'Aplicar'}
              </button>
            </div>
          )}
          {couponError && <p className="text-sm text-red-600">{couponError}</p>}
        </div>

        {/* Payment */}
        <div className="bg-white border border-stone-200 rounded-xl p-6">
          <PaymentSelector method={paymentMethod} setMethod={setPaymentMethod} />
        </div>

        {/* Order Review */}
        <div className="bg-stone-50 border border-stone-200 rounded-xl p-6">
          <OrderReview
            items={items}
            subtotal={subtotal}
            shippingCost={selectedShipping?.price ?? 0}
            shippingMethod={selectedShipping?.method ?? 'A calcular'}
            discount={discount}
            couponCode={couponApplied ? couponCode : undefined}
          />
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <p className="text-sm text-red-700">{error}</p>
          </div>
        )}

        <button
          type="submit"
          disabled={submitting}
          className="w-full py-4 bg-amber-600 text-white text-lg font-semibold rounded-xl hover:bg-amber-700 transition-colors disabled:opacity-50"
        >
          {submitting ? 'Processando...' : 'Confirmar Pedido'}
        </button>
      </form>
    </div>
  )
}
