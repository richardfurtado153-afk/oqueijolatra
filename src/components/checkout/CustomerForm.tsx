'use client'

import { useState } from 'react'
import { formatPhone, formatCpf } from '@/lib/utils'

interface CustomerFormProps {
  name: string
  setName: (v: string) => void
  email: string
  setEmail: (v: string) => void
  phone: string
  setPhone: (v: string) => void
  cpf: string
  setCpf: (v: string) => void
}

function validateCpf(cpf: string): boolean {
  const digits = cpf.replace(/\D/g, '')
  if (digits.length !== 11) return false
  if (/^(\d)\1+$/.test(digits)) return false
  let sum = 0
  for (let i = 0; i < 9; i++) sum += parseInt(digits[i]) * (10 - i)
  let check = 11 - (sum % 11)
  if (check >= 10) check = 0
  if (parseInt(digits[9]) !== check) return false
  sum = 0
  for (let i = 0; i < 10; i++) sum += parseInt(digits[i]) * (11 - i)
  check = 11 - (sum % 11)
  if (check >= 10) check = 0
  return parseInt(digits[10]) === check
}

function validateEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

const inputBase = 'w-full border rounded-lg px-3 py-2 text-sm outline-none transition-colors'
const inputNormal = `${inputBase} border-stone-300 focus:border-amber-600 focus:ring-1 focus:ring-amber-600`
const inputError = `${inputBase} border-red-400 focus:border-red-500 focus:ring-1 focus:ring-red-500`

export default function CustomerForm({
  name, setName,
  email, setEmail,
  phone, setPhone,
  cpf, setCpf,
}: CustomerFormProps) {
  const [touched, setTouched] = useState<Record<string, boolean>>({})

  function markTouched(field: string) {
    setTouched((prev) => ({ ...prev, [field]: true }))
  }

  const errors: Record<string, string | null> = {
    name: touched.name && name.trim().length < 3 ? 'Informe seu nome completo' : null,
    email: touched.email && !validateEmail(email) ? 'Informe um e-mail valido' : null,
    phone: touched.phone && phone.replace(/\D/g, '').length < 10 ? 'Informe um telefone valido' : null,
    cpf: touched.cpf && !validateCpf(cpf) ? 'CPF invalido' : null,
  }

  return (
    <fieldset className="space-y-4">
      <legend className="text-lg font-semibold text-stone-800">Dados Pessoais</legend>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="sm:col-span-2">
          <label htmlFor="checkout-name" className="block text-sm font-medium text-stone-700 mb-1">
            Nome completo <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() => markTouched('name')}
            required
            autoComplete="name"
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'name-error' : undefined}
            className={errors.name ? inputError : inputNormal}
          />
          {errors.name && <p id="name-error" className="text-xs text-red-600 mt-1" role="alert">{errors.name}</p>}
        </div>

        <div>
          <label htmlFor="checkout-email" className="block text-sm font-medium text-stone-700 mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() => markTouched('email')}
            required
            autoComplete="email"
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
            className={errors.email ? inputError : inputNormal}
          />
          {errors.email && <p id="email-error" className="text-xs text-red-600 mt-1" role="alert">{errors.email}</p>}
        </div>

        <div>
          <label htmlFor="checkout-phone" className="block text-sm font-medium text-stone-700 mb-1">
            Telefone <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-phone"
            type="text"
            value={phone}
            onChange={(e) => setPhone(formatPhone(e.target.value))}
            onBlur={() => markTouched('phone')}
            placeholder="(00) 00000-0000"
            required
            autoComplete="tel"
            inputMode="numeric"
            aria-invalid={!!errors.phone}
            aria-describedby={errors.phone ? 'phone-error' : undefined}
            className={errors.phone ? inputError : inputNormal}
          />
          {errors.phone && <p id="phone-error" className="text-xs text-red-600 mt-1" role="alert">{errors.phone}</p>}
        </div>

        <div>
          <label htmlFor="checkout-cpf" className="block text-sm font-medium text-stone-700 mb-1">
            CPF <span className="text-red-500">*</span>
          </label>
          <input
            id="checkout-cpf"
            type="text"
            value={cpf}
            onChange={(e) => setCpf(formatCpf(e.target.value))}
            onBlur={() => markTouched('cpf')}
            placeholder="000.000.000-00"
            required
            inputMode="numeric"
            aria-invalid={!!errors.cpf}
            aria-describedby={errors.cpf ? 'cpf-error' : undefined}
            className={errors.cpf ? inputError : inputNormal}
          />
          {errors.cpf && <p id="cpf-error" className="text-xs text-red-600 mt-1" role="alert">{errors.cpf}</p>}
        </div>
      </div>
    </fieldset>
  )
}
