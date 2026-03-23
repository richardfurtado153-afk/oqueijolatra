# User Account Management Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add profile editing, saved address management (CRUD), and tracking code display on orders to the customer account area.

**Architecture:** Server components for data display, Server Actions for mutations. ViaCEP API for CEP auto-fill. All pages under `/conta/*` already have auth protection via the existing `conta/layout.tsx`.

**Tech Stack:** Next.js Server Actions, ViaCEP public API (no key needed), bcryptjs for password change.

---

## File Map

**New files:**
- `src/app/conta/perfil/page.tsx` — profile editing (name, phone, CPF + change password)
- `src/app/conta/enderecos/page.tsx` — address list + add/edit/delete/set-default
- `src/app/conta/enderecos/novo/page.tsx` — add new address form with CEP auto-fill
- `src/app/admin/actions/orders.ts` — add `addTrackingCode` action (extends existing file)
- `src/app/admin/pedidos/[id]/page.tsx` — add tracking code field (extends existing file)
- `src/app/conta/pedidos/[id]/page.tsx` — show tracking code to customer

**Modified files:**
- `src/app/conta/page.tsx` — add link to Perfil and Endereços
- `src/app/conta/layout.tsx` — add nav items for Perfil and Endereços
- `prisma/schema.prisma` — add `trackingCode` to Order

---

### Task 1: Add tracking code to Order model

**Files:**
- Modify: `prisma/schema.prisma`
- Modify: `src/app/admin/actions/orders.ts`
- Modify: `src/app/admin/pedidos/[id]/page.tsx`
- Modify: `src/app/conta/pedidos/[id]/page.tsx`

- [ ] **Step 1: Add trackingCode to Order**

In `prisma/schema.prisma`, add to Order model after `paymentExternalId String?`:
```prisma
trackingCode         String?
```

- [ ] **Step 2: Migrate**

```bash
cd /Users/richardfurtado/Downloads/oqueijolatra
npx prisma migrate dev --name add-tracking-code
npx prisma generate
```

- [ ] **Step 3: Add addTrackingCode action**

In `src/app/admin/actions/orders.ts`, add:
```ts
export async function addTrackingCode(orderId: string, trackingCode: string) {
  await prisma.order.update({
    where: { id: orderId },
    data: { trackingCode, status: 'SHIPPED' }
  })
  revalidatePath(`/admin/pedidos/${orderId}`)
}
```

- [ ] **Step 4: Add tracking code form to admin order detail**

In `src/app/admin/pedidos/[id]/page.tsx`, after the status update form, add:
```tsx
<div className="bg-white rounded-xl p-5 border border-stone-200 mt-4">
  <h2 className="font-semibold mb-3 text-stone-700">Código de Rastreio</h2>
  {order.trackingCode && (
    <p className="mb-3 font-mono text-lg text-amber-700">{order.trackingCode}</p>
  )}
  <form className="flex gap-3">
    <input type="hidden" name="orderId" value={order.id} />
    <input name="trackingCode" defaultValue={order.trackingCode ?? ''} placeholder="Ex: BR123456789BR"
      className="flex-1 border border-stone-300 rounded-lg px-3 py-2 text-sm" />
    <button formAction={async (fd: FormData) => {
      'use server'
      await addTrackingCode(fd.get('orderId') as string, fd.get('trackingCode') as string)
    }} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium">
      Salvar
    </button>
  </form>
</div>
```

- [ ] **Step 5: Show tracking code to customer**

In `src/app/conta/pedidos/[id]/page.tsx`, after the status badge, add:
```tsx
{order.trackingCode && (
  <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 my-4">
    <p className="text-sm text-amber-800 font-medium">Seu pedido foi enviado!</p>
    <p className="text-sm text-amber-700 mt-1">
      Código de rastreio: <span className="font-mono font-bold">{order.trackingCode}</span>
    </p>
    <a href="https://rastreamento.correios.com.br" target="_blank" rel="noopener noreferrer"
      className="text-sm text-amber-700 hover:underline mt-1 inline-block">
      Rastrear nos Correios →
    </a>
  </div>
)}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: tracking code on orders (admin + customer view)"
```

---

### Task 2: Profile editing page

**Files:**
- Create: `src/app/conta/perfil/page.tsx`

- [ ] **Step 1: Create profile page with edit and change password**

Create `src/app/conta/perfil/page.tsx`:
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

async function updateProfile(fd: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/conta/login')
  await prisma.customer.update({
    where: { id: session.user.id as string },
    data: {
      name: fd.get('name') as string,
      phone: fd.get('phone') as string || null,
    }
  })
  revalidatePath('/conta/perfil')
}

async function changePassword(fd: FormData) {
  'use server'
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/conta/login')
  const customer = await prisma.customer.findUnique({ where: { id: session.user.id as string } })
  if (!customer) return
  const currentPassword = fd.get('currentPassword') as string
  const newPassword = fd.get('newPassword') as string
  const valid = await bcrypt.compare(currentPassword, customer.passwordHash)
  if (!valid) throw new Error('Senha atual incorreta')
  if (newPassword.length < 6) throw new Error('Nova senha deve ter no mínimo 6 caracteres')
  await prisma.customer.update({
    where: { id: customer.id },
    data: { passwordHash: await bcrypt.hash(newPassword, 10) }
  })
  revalidatePath('/conta/perfil')
}

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/conta/login')
  const customer = await prisma.customer.findUnique({ where: { id: session.user.id as string } })
  if (!customer) redirect('/conta/login')

  return (
    <div className="max-w-lg space-y-6">
      <h1 className="text-2xl font-bold text-stone-800">Meu Perfil</h1>

      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="font-semibold text-stone-700 mb-4">Dados pessoais</h2>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nome completo</label>
            <input name="name" defaultValue={customer.name} required
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">E-mail</label>
            <input value={customer.email} disabled
              className="w-full border border-stone-200 rounded-lg px-3 py-2 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Telefone</label>
            <input name="phone" defaultValue={customer.phone ?? ''} placeholder="(11) 99999-9999"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
            Salvar alterações
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="font-semibold text-stone-700 mb-4">Alterar senha</h2>
        <form action={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Senha atual</label>
            <input type="password" name="currentPassword" required
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-600 mb-1">Nova senha (mín. 6 caracteres)</label>
            <input type="password" name="newPassword" required minLength={6}
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <button type="submit" className="bg-stone-700 hover:bg-stone-800 text-white px-6 py-2.5 rounded-lg text-sm font-medium">
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Add Perfil link to conta dashboard**

In `src/app/conta/page.tsx`, add a link card for "Meu Perfil":
```tsx
<Link href="/conta/perfil" className="...">Meu Perfil</Link>
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: customer profile editing and password change"
```

---

### Task 3: Address management (list, add, delete, set-default)

**Files:**
- Create: `src/app/conta/enderecos/page.tsx`
- Create: `src/app/conta/enderecos/novo/page.tsx`

- [ ] **Step 1: Create address list page**

Create `src/app/conta/enderecos/page.tsx`:
```tsx
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'
import Link from 'next/link'

async function deleteAddress(id: string) {
  'use server'
  await prisma.customerAddress.delete({ where: { id } })
  revalidatePath('/conta/enderecos')
}

async function setDefaultAddress(id: string, customerId: string) {
  'use server'
  await prisma.$transaction([
    prisma.customerAddress.updateMany({ where: { customerId }, data: { isDefault: false } }),
    prisma.customerAddress.update({ where: { id }, data: { isDefault: true } }),
  ])
  revalidatePath('/conta/enderecos')
}

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/conta/login')
  const customerId = session.user.id as string
  const addresses = await prisma.customerAddress.findMany({
    where: { customerId },
    orderBy: [{ isDefault: 'desc' }, { id: 'asc' }],
  })

  return (
    <div className="max-w-xl">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Meus Endereços</h1>
        <Link href="/conta/enderecos/novo" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Novo endereço
        </Link>
      </div>
      <div className="space-y-3">
        {addresses.map((a) => (
          <div key={a.id} className={`bg-white rounded-xl p-5 border ${a.isDefault ? 'border-amber-400 bg-amber-50' : 'border-stone-200'}`}>
            <div className="flex items-start justify-between">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-stone-800">{a.label}</span>
                  {a.isDefault && <span className="text-xs bg-amber-600 text-white px-2 py-0.5 rounded-full">Padrão</span>}
                </div>
                <p className="text-sm text-stone-600">{a.street}, {a.number}{a.complement ? `, ${a.complement}` : ''}</p>
                <p className="text-sm text-stone-600">{a.neighborhood} — {a.city}/{a.state}</p>
                <p className="text-sm text-stone-500">CEP: {a.cep}</p>
              </div>
              <div className="flex gap-3 flex-col items-end">
                {!a.isDefault && (
                  <form action={setDefaultAddress.bind(null, a.id, customerId)}>
                    <button className="text-xs text-amber-700 hover:underline">Tornar padrão</button>
                  </form>
                )}
                <form action={deleteAddress.bind(null, a.id)}>
                  <button className="text-xs text-red-500 hover:underline">Excluir</button>
                </form>
              </div>
            </div>
          </div>
        ))}
        {addresses.length === 0 && (
          <div className="text-center py-12 text-stone-400 bg-white rounded-xl border border-stone-200">
            Nenhum endereço cadastrado.
          </div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Create add-address page with ViaCEP auto-fill**

Create `src/app/conta/enderecos/novo/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function NewAddressPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [cepLoading, setCepLoading] = useState(false)
  const [form, setForm] = useState({
    label: 'Casa', cep: '', street: '', number: '', complement: '', neighborhood: '', city: '', state: '',
  })

  async function handleCepBlur() {
    const cep = form.cep.replace(/\D/g, '')
    if (cep.length !== 8) return
    setCepLoading(true)
    try {
      const res = await fetch(`https://viacep.com.br/ws/${cep}/json/`)
      const data = await res.json()
      if (!data.erro) {
        setForm((f) => ({ ...f, street: data.logradouro, neighborhood: data.bairro, city: data.localidade, state: data.uf }))
      }
    } finally {
      setCepLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/customers/addresses', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
    router.push('/conta/enderecos')
  }

  const field = (name: keyof typeof form, label: string, props?: object) => (
    <div>
      <label className="block text-sm font-medium text-stone-600 mb-1">{label}</label>
      <input name={name} value={form[name]} onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500"
        {...props} />
    </div>
  )

  return (
    <div className="max-w-lg">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Novo Endereço</h1>
      <form onSubmit={handleSubmit} className="bg-white rounded-xl p-6 border border-stone-200 space-y-4">
        {field('label', 'Identificação (ex: Casa, Trabalho)')}
        <div>
          <label className="block text-sm font-medium text-stone-600 mb-1">CEP *</label>
          <input value={form.cep} onChange={(e) => setForm((f) => ({ ...f, cep: e.target.value }))}
            onBlur={handleCepBlur} placeholder="00000-000" required maxLength={9}
            className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          {cepLoading && <p className="text-xs text-stone-400 mt-1">Buscando CEP...</p>}
        </div>
        {field('street', 'Rua / Avenida *', { required: true })}
        <div className="grid grid-cols-2 gap-3">
          {field('number', 'Número *', { required: true })}
          {field('complement', 'Complemento')}
        </div>
        {field('neighborhood', 'Bairro *', { required: true })}
        <div className="grid grid-cols-2 gap-3">
          {field('city', 'Cidade *', { required: true })}
          {field('state', 'Estado *', { required: true, maxLength: 2, placeholder: 'SP' })}
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" disabled={loading}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            {loading ? 'Salvando...' : 'Salvar endereço'}
          </button>
          <button type="button" onClick={() => router.back()}
            className="bg-stone-200 hover:bg-stone-300 px-6 py-2.5 rounded-lg text-sm font-medium">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Create address API endpoint**

Create `src/app/api/customers/addresses/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) return NextResponse.json({ error: 'Não autenticado' }, { status: 401 })

  const data = await request.json()
  const address = await prisma.customerAddress.create({
    data: {
      customerId: session.user.id as string,
      label: data.label || 'Casa',
      cep: data.cep.replace(/\D/g, ''),
      street: data.street,
      number: data.number,
      complement: data.complement || null,
      neighborhood: data.neighborhood,
      city: data.city,
      state: data.state.toUpperCase(),
    }
  })

  return NextResponse.json(address)
}
```

- [ ] **Step 4: Update conta dashboard with links**

In `src/app/conta/page.tsx`, add Endereços and Perfil links alongside existing Pedidos/Favoritos links.

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: customer address management with ViaCEP auto-fill"
```
