'use client'

import { useState } from 'react'

export default function NewsletterBar() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [discountCode, setDiscountCode] = useState('')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return

    setStatus('loading')
    try {
      const res = await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()
      if (!res.ok) {
        setErrorMsg(data.error || 'Erro ao cadastrar.')
        setStatus('error')
        return
      }
      setDiscountCode(data.discountCode)
      setStatus('success')
    } catch {
      setErrorMsg('Erro de conexão. Tente novamente.')
      setStatus('error')
    }
  }

  return (
    <section className="bg-gradient-to-r from-amber-700 via-amber-600 to-yellow-600 py-10 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <h2 className="text-white text-xl md:text-2xl font-bold mb-2">
          Cadastre-se e ganhe 10% de desconto
        </h2>
        <p className="text-amber-100 text-sm mb-6">
          Receba novidades e promoções exclusivas no seu e-mail.
        </p>

        {status === 'success' ? (
          <div className="bg-white/20 backdrop-blur rounded-lg p-6">
            <p className="text-white font-semibold text-lg mb-1">
              Obrigado por se inscrever!
            </p>
            <p className="text-amber-100 text-sm mb-3">
              Use o cupom abaixo para ganhar 10% de desconto:
            </p>
            <span className="inline-block bg-white text-amber-800 font-bold text-lg px-6 py-2 rounded-md tracking-wider">
              {discountCode}
            </span>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3 justify-center">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu melhor e-mail"
              required
              className="px-4 py-3 rounded-lg text-stone-800 placeholder:text-stone-400 flex-1 max-w-md focus:outline-none focus:ring-2 focus:ring-amber-300"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              className="bg-stone-900 text-white font-semibold px-8 py-3 rounded-lg hover:bg-stone-800 transition-colors disabled:opacity-60"
            >
              {status === 'loading' ? 'Enviando...' : 'Inscrever'}
            </button>
          </form>
        )}

        {status === 'error' && (
          <p className="text-red-200 text-sm mt-3">{errorMsg}</p>
        )}
      </div>
    </section>
  )
}
