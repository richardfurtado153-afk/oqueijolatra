'use client'

interface PaymentSelectorProps {
  method: 'PIX' | 'CARD'
  setMethod: (v: 'PIX' | 'CARD') => void
}

export default function PaymentSelector({ method, setMethod }: PaymentSelectorProps) {
  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-stone-800">Forma de Pagamento</legend>

      <div className="space-y-3" role="radiogroup" aria-label="Metodo de pagamento">
        <label
          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            method === 'PIX'
              ? 'border-amber-600 bg-amber-50 shadow-sm'
              : 'border-stone-200 hover:border-stone-300'
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
            <span className="text-sm font-medium text-stone-800 flex items-center gap-2">
              PIX
              <span className="text-xs bg-green-100 text-green-700 px-1.5 py-0.5 rounded font-medium">Recomendado</span>
            </span>
            <p className="text-xs text-stone-500 mt-0.5">
              Pagamento instantaneo. Voce recebera um QR Code apos confirmar o pedido.
            </p>
          </div>
        </label>

        <label
          className={`flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer transition-all duration-200 ${
            method === 'CARD'
              ? 'border-amber-600 bg-amber-50 shadow-sm'
              : 'border-stone-200 hover:border-stone-300'
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
    </fieldset>
  )
}
