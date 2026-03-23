'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus('loading')
    const res = await fetch('/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    })
    setStatus(res.ok ? 'success' : 'error')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 mb-2 text-center">Esqueci minha senha</h1>
        <p className="text-stone-500 text-center mb-8">Informe seu e-mail e enviaremos um link para redefinir sua senha.</p>

        {status === 'success' ? (
          <div className="bg-green-50 border border-green-200 rounded-xl p-6 text-center">
            <p className="text-green-700 font-medium">E-mail enviado!</p>
            <p className="text-green-600 text-sm mt-1">Verifique sua caixa de entrada e siga as instruções.</p>
            <Link href="/conta/login" className="mt-4 inline-block text-amber-700 hover:underline text-sm">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm space-y-4">
            {status === 'error' && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                Erro ao processar. Tente novamente.
              </div>
            )}
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
              <input
                type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                required className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
                placeholder="seu@email.com"
              />
            </div>
            <button type="submit" disabled={status === 'loading'}
              className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors">
              {status === 'loading' ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
            <div className="text-center">
              <Link href="/conta/login" className="text-stone-500 hover:text-stone-700 text-sm">Voltar ao login</Link>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
