'use client'

interface PaymentSelectorProps {
  method: 'PIX' | 'CARD'
  setMethod: (v: 'PIX' | 'CARD') => void
}

export default function PaymentSelector({ method, setMethod }: PaymentSelectorProps) {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-stone-800">Forma de Pagamento</h2>

      <div className="space-y-3">
        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            method === 'PIX'
              ? 'border-amber-600 bg-amber-50'
              : 'border-stone-300 hover:border-stone-400'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="PIX"
            checked={method === 'PIX'}
            onChange={() => setMethod('PIX')}
            className="mt-0.5 accent-amber-600"
          />
          <div>
            <span className="text-sm font-medium text-stone-800">PIX</span>
            <p className="text-xs text-stone-500 mt-0.5">
              Pagamento instantaneo. Voce recebera um QR Code apos confirmar o pedido.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors ${
            method === 'CARD'
              ? 'border-amber-600 bg-amber-50'
              : 'border-stone-300 hover:border-stone-400'
          }`}
        >
          <input
            type="radio"
            name="payment"
            value="CARD"
            checked={method === 'CARD'}
            onChange={() => setMethod('CARD')}
            className="mt-0.5 accent-amber-600"
          />
          <div>
            <span className="text-sm font-medium text-stone-800">Cartao de Credito</span>
            <p className="text-xs text-stone-500 mt-0.5">
              Pagamento processado na hora. Parcele em ate 3x sem juros.
            </p>
          </div>
        </label>
      </div>
    </div>
  )
}
