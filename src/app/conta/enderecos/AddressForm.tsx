'use client'
import { useRef, useState } from 'react'

interface Props {
  createAddress: (fd: FormData) => Promise<void>
}

export default function AddressForm({ createAddress }: Props) {
  const formRef = useRef<HTMLFormElement>(null)
  const [loading, setLoading] = useState(false)

  async function handleCepBlur(e: React.FocusEvent<HTMLInputElement>) {
    const cep = e.target.value.replace(/\D/g, '')
    if (cep.length !== 8) return
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (data.erro) return
      const form = formRef.current
      if (!form) return
      ;(form.elements.namedItem('street') as HTMLInputElement).value = data.logradouro ?? ''
      ;(form.elements.namedItem('neighborhood') as HTMLInputElement).value = data.bairro ?? ''
      ;(form.elements.namedItem('city') as HTMLInputElement).value = data.localidade ?? ''
      ;(form.elements.namedItem('state') as HTMLInputElement).value = data.uf ?? ''
      ;(form.elements.namedItem('number') as HTMLInputElement).focus()
    } catch {}
  }

  async function handleSubmit(fd: FormData) {
    setLoading(true)
    try {
      await createAddress(fd)
      formRef.current?.reset()
    } finally {
      setLoading(false)
    }
  }

  return (
    <form ref={formRef} action={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Identificação</label>
          <input name="label" placeholder="Casa, Trabalho..." defaultValue="Casa"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">CEP *</label>
          <input name="cep" required placeholder="00000-000" onBlur={handleCepBlur}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div className="col-span-2">
          <label className="block text-sm font-medium text-stone-700 mb-1">Rua *</label>
          <input name="street" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Número *</label>
          <input name="number" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Complemento</label>
          <input name="complement" placeholder="Apto, bloco..." className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Bairro *</label>
          <input name="neighborhood" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Cidade *</label>
          <input name="city" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
        </div>
        <div>
          <label className="block text-sm font-medium text-stone-700 mb-1">Estado *</label>
          <input name="state" required maxLength={2} placeholder="SP"
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm uppercase" />
        </div>
        <div className="col-span-2">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" name="isDefault" />
            Usar como endereço principal
          </label>
        </div>
      </div>
      <button type="submit" disabled={loading}
        className="bg-amber-600 hover:bg-amber-700 disabled:opacity-60 text-white px-6 py-2 rounded-lg text-sm font-medium">
        {loading ? 'Salvando...' : 'Adicionar Endereço'}
      </button>
    </form>
  )
}
