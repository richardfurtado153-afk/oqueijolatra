'use client'

import { useState } from 'react'
import { signIn } from 'next-auth/react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function RegisterPage() {
  const router = useRouter()

  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '',
    cpf: '',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  function updateField(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError('')

    if (form.password !== form.confirmPassword) {
      setError('As senhas nao coincidem')
      return
    }

    if (form.password.length < 8) {
      setError('A senha deve ter pelo menos 8 caracteres')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/customers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: form.name,
          email: form.email,
          password: form.password,
          phone: form.phone || undefined,
          cpf: form.cpf || undefined,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'Erro ao criar conta')
        return
      }

      // Auto-login after registration
      const result = await signIn('credentials', {
        email: form.email,
        password: form.password,
        redirect: false,
      })

      if (result?.error) {
        // Account created but login failed, redirect to login
        router.push('/conta/login')
      } else {
        router.push('/conta')
        router.refresh()
      }
    } catch {
      setError('Erro ao criar conta. Tente novamente.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto">
      <h1 className="text-2xl font-bold text-stone-900 mb-6">Criar Conta</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-4 flex items-center gap-2" role="alert">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div>
          <label htmlFor="reg-name" className="block text-sm font-medium text-stone-700 mb-1">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-name"
            type="text"
            required
            value={form.name}
            onChange={(e) => updateField('name', e.target.value)}
            autoComplete="name"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="reg-email" className="block text-sm font-medium text-stone-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-email"
            type="email"
            required
            value={form.email}
            onChange={(e) => updateField('email', e.target.value)}
            autoComplete="email"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
          />
        </div>

        <div>
          <label htmlFor="reg-phone" className="block text-sm font-medium text-stone-700 mb-1">
            Telefone <span className="text-xs text-stone-400 font-normal">(opcional)</span>
          </label>
          <input
            id="reg-phone"
            type="tel"
            value={form.phone}
            onChange={(e) => updateField('phone', e.target.value)}
            autoComplete="tel"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            placeholder="(11) 99999-9999"
          />
        </div>

        <div>
          <label htmlFor="reg-cpf" className="block text-sm font-medium text-stone-700 mb-1">
            CPF <span className="text-xs text-stone-400 font-normal">(opcional)</span>
          </label>
          <input
            id="reg-cpf"
            type="text"
            value={form.cpf}
            onChange={(e) => updateField('cpf', e.target.value)}
            inputMode="numeric"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            placeholder="000.000.000-00"
          />
        </div>

        <div>
          <label htmlFor="reg-password" className="block text-sm font-medium text-stone-700 mb-1">
            Senha <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-password"
            type="password"
            required
            value={form.password}
            onChange={(e) => updateField('password', e.target.value)}
            autoComplete="new-password"
            className="w-full px-3 py-2 border border-stone-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors"
            placeholder="Minimo 8 caracteres"
          />
          {form.password.length > 0 && form.password.length < 8 && (
            <p className="text-xs text-amber-600 mt-1">A senha precisa ter pelo menos 8 caracteres</p>
          )}
        </div>

        <div>
          <label htmlFor="reg-confirmPassword" className="block text-sm font-medium text-stone-700 mb-1">
            Confirmar senha <span className="text-red-500">*</span>
          </label>
          <input
            id="reg-confirmPassword"
            type="password"
            required
            value={form.confirmPassword}
            onChange={(e) => updateField('confirmPassword', e.target.value)}
            autoComplete="new-password"
            className={`w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-colors ${
              form.confirmPassword.length > 0 && form.password !== form.confirmPassword
                ? 'border-red-400'
                : 'border-stone-300'
            }`}
          />
          {form.confirmPassword.length > 0 && form.password !== form.confirmPassword && (
            <p className="text-xs text-red-600 mt-1">As senhas nao coincidem</p>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-amber-600 text-white font-semibold py-2.5 rounded-lg hover:bg-amber-700 active:scale-[0.98] transition-all disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {loading ? (
            <span className="inline-flex items-center gap-2">
              <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Criando conta...
            </span>
          ) : 'Criar Conta'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-stone-500">
        Ja tem conta?{' '}
        <Link href="/conta/login" className="text-amber-700 hover:underline font-medium">
          Entrar
        </Link>
      </p>
    </div>
  )
}
