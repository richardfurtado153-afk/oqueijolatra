'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token') ?? ''
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) { setErrorMsg('As senhas não coincidem'); return }
    if (password.length < 8) { setErrorMsg('Mínimo 8 caracteres'); return }
    setStatus('loading')
    setErrorMsg('')
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, password }),
    })
    if (res.ok) {
      setStatus('success')
      setTimeout(() => router.push('/conta/login'), 2000)
    } else {
      const data = await res.json()
      setErrorMsg(data.error ?? 'Erro ao redefinir senha')
      setStatus('error')
    }
  }

  if (!token) {
    return (
      <div className="text-center">
        <p className="text-red-600">Link inválido.</p>
        <Link href="/conta/esqueci-senha" className="text-amber-700 hover:underline mt-2 inline-block">Solicitar novo link</Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-stone-200 shadow-sm space-y-4">
      {status === 'success' && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded-lg text-sm text-center">
          Senha redefinida! Redirecionando...
        </div>
      )}
      {errorMsg && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">{errorMsg}</div>
      )}
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Nova senha</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          required minLength={8} className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
          placeholder="Mínimo 8 caracteres" />
      </div>
      <div>
        <label className="block text-sm font-medium text-stone-700 mb-1">Confirmar senha</label>
        <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
          required minLength={8} className="w-full border border-stone-300 rounded-lg px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
      </div>
      <button type="submit" disabled={status === 'loading'}
        className="w-full bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white font-semibold py-3 rounded-lg transition-colors">
        {status === 'loading' ? 'Salvando...' : 'Redefinir Senha'}
      </button>
    </form>
  )
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50 px-4">
      <div className="w-full max-w-md">
        <h1 className="text-2xl font-bold text-stone-800 mb-8 text-center">Redefinir Senha</h1>
        <Suspense fallback={<div className="text-center text-stone-400">Carregando...</div>}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  )
}
