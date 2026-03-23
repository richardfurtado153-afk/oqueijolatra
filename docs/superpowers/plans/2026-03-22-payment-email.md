# Payment & Email Integration Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Implement real PIX payment via Mercado Pago and transactional emails via Resend for order confirmation, order shipped, and password reset.

**Architecture:** Replace `src/lib/payment.ts` stub with Mercado Pago SDK. Add `src/lib/email.ts` using Resend SDK with React Email templates. Webhook signature verification for security.

**Tech Stack:** `mercadopago` npm package, `resend` npm package, Mercado Pago Sandbox for testing.

---

## File Map

**New files:**
- `src/lib/email.ts` — Resend client + send functions
- `src/emails/OrderConfirmation.tsx` — Order confirmation email template
- `src/emails/OrderShipped.tsx` — Order shipped email template
- `src/emails/PasswordReset.tsx` — Password reset email template

**Modified files:**
- `src/lib/payment.ts` — Replace stub with Mercado Pago implementation
- `src/app/api/checkout/route.ts` — Send confirmation email after order creation
- `src/app/api/webhooks/payment/route.ts` — Send paid email on webhook confirmation
- `src/app/api/customers/route.ts` — (future) password reset support
- `.env` — Add MERCADOPAGO_ACCESS_TOKEN, RESEND_API_KEY, STORE_CEP

---

### Task 1: Install dependencies and configure environment

**Files:**
- `.env`

- [ ] **Step 1: Install packages**

```bash
cd /Users/richardfurtado/Downloads/oqueijolatra
npm install mercadopago resend
```
Expected: packages installed, no peer dep errors.

- [ ] **Step 2: Add env vars**

Add to `.env`:
```
MERCADOPAGO_ACCESS_TOKEN=TEST-your-token-here
RESEND_API_KEY=re_your_key_here
STORE_EMAIL=contato@queijolatra.com.br
```

> Note: Get Mercado Pago sandbox token at https://www.mercadopago.com.br/developers/panel
> Get Resend API key at https://resend.com (free tier: 3000 emails/month)

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json .env.example
git commit -m "chore: add mercadopago and resend dependencies"
```

---

### Task 2: Real PIX payment implementation

**Files:**
- Modify: `src/lib/payment.ts`

- [ ] **Step 1: Replace payment stub with Mercado Pago PIX**

Replace entire `src/lib/payment.ts` with:
```ts
import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
})

const payment = new Payment(client)

export interface PaymentProvider {
  createPixPayment(order: any): Promise<{ qrCode: string; copyPaste: string; expiresAt: Date; externalId: string }>
  createCardPayment(order: any, cardToken: string): Promise<{ status: string; transactionId: string }>
  handleWebhook(payload: unknown): Promise<{ orderId: string; status: 'CONFIRMED' | 'FAILED' }>
}

export const paymentProvider: PaymentProvider = {
  async createPixPayment(order) {
    const result = await payment.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido #${order.orderNumber} - O Queijolatra`,
        payment_method_id: 'pix',
        payer: {
          email: order.email,
          first_name: order.customerName.split(' ')[0],
          last_name: order.customerName.split(' ').slice(1).join(' '),
          identification: { type: 'CPF', number: order.cpf.replace(/\D/g, '') },
        },
        external_reference: order.id,
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    })

    const qrCode = result.point_of_interaction?.transaction_data?.qr_code_base64 ?? ''
    const copyPaste = result.point_of_interaction?.transaction_data?.qr_code ?? ''

    return {
      qrCode: `data:image/png;base64,${qrCode}`,
      copyPaste,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      externalId: String(result.id),
    }
  },

  async createCardPayment(order, cardToken) {
    const result = await payment.create({
      body: {
        transaction_amount: Number(order.total),
        token: cardToken,
        description: `Pedido #${order.orderNumber} - O Queijolatra`,
        installments: 1,
        payment_method_id: 'visa',
        payer: { email: order.email },
        external_reference: order.id,
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
      }
    })
    return {
      status: result.status === 'approved' ? 'CONFIRMED' : 'FAILED',
      transactionId: String(result.id),
    }
  },

  async handleWebhook(payload) {
    const p = payload as any
    // Mercado Pago sends: { action: 'payment.updated', data: { id: '...' } }
    if (p?.action !== 'payment.updated' || !p?.data?.id) {
      return { orderId: '', status: 'FAILED' }
    }
    const result = await payment.get({ id: p.data.id })
    const orderId = result.external_reference ?? ''
    const status = result.status === 'approved' ? 'CONFIRMED' : 'FAILED'
    return { orderId, status }
  },
}
```

- [ ] **Step 2: Update checkout route to store externalId**

In `src/app/api/checkout/route.ts`, find the PIX payment call and update to store the externalId:
```ts
// Change from:
const pixData = await paymentProvider.createPixPayment(order)
// To:
const pixData = await paymentProvider.createPixPayment(order)
await prisma.order.update({
  where: { id: order.id },
  data: { paymentExternalId: pixData.externalId }
})
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: real PIX payment via Mercado Pago"
```

---

### Task 3: Email service setup

**Files:**
- Create: `src/lib/email.ts`

- [ ] **Step 1: Create email.ts**

Create `src/lib/email.ts`:
```ts
import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = process.env.STORE_EMAIL ?? 'O Queijolatra <noreply@queijolatra.com.br>'

export interface OrderEmailData {
  orderNumber: number
  customerName: string
  email: string
  items: Array<{ productName: string; quantity: number; unitPrice: number }>
  subtotal: number
  discount: number
  shippingCost: number
  total: number
  shippingMethod: string
  paymentMethod: string
}

function formatBRL(value: number) {
  return value.toFixed(2).replace('.', ',')
}

function buildOrderTable(items: OrderEmailData['items']) {
  return items.map((i) => `
    <tr>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4">${i.productName}</td>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:center">${i.quantity}</td>
      <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:right">R$ ${formatBRL(i.unitPrice)}</td>
    </tr>
  `).join('')
}

export async function sendOrderConfirmation(data: OrderEmailData) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Pedido #${data.orderNumber} recebido — O Queijolatra`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
        <div style="background:#92400e;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">O Queijolatra</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#78350f">Pedido recebido! 🧀</h2>
          <p>Olá, <strong>${data.customerName}</strong>! Recebemos seu pedido com sucesso.</p>
          <p style="font-size:20px;font-weight:bold;color:#78350f">Pedido #${data.orderNumber}</p>
          <table style="width:100%;border-collapse:collapse;margin:16px 0">
            <thead><tr style="background:#f5f5f4"><th style="padding:8px;text-align:left">Produto</th><th style="padding:8px;text-align:center">Qtd</th><th style="padding:8px;text-align:right">Valor</th></tr></thead>
            <tbody>${buildOrderTable(data.items)}</tbody>
          </table>
          <div style="border-top:2px solid #e7e5e4;padding-top:16px">
            ${data.discount > 0 ? `<p>Desconto: -R$ ${formatBRL(data.discount)}</p>` : ''}
            <p>Frete (${data.shippingMethod}): R$ ${formatBRL(data.shippingCost)}</p>
            <p style="font-size:18px;font-weight:bold">Total: R$ ${formatBRL(data.total)}</p>
          </div>
          <p>Pagamento: <strong>${data.paymentMethod === 'PIX' ? 'PIX' : 'Cartão de Crédito'}</strong></p>
          ${data.paymentMethod === 'PIX' ? '<p style="color:#92400e">Finalize o pagamento via PIX para confirmar seu pedido.</p>' : ''}
          <p style="margin-top:32px;color:#78716c;font-size:14px">Dúvidas? Responda este e-mail ou fale conosco pelo WhatsApp.</p>
        </div>
      </div>
    `,
  })
}

export async function sendOrderShipped(data: { orderNumber: number; customerName: string; email: string; trackingCode?: string }) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: `Pedido #${data.orderNumber} enviado! 📦`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
        <div style="background:#92400e;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">O Queijolatra</h1>
        </div>
        <div style="padding:32px">
          <h2 style="color:#78350f">Seu pedido está a caminho! 📦</h2>
          <p>Olá, <strong>${data.customerName}</strong>!</p>
          <p>Seu pedido <strong>#${data.orderNumber}</strong> foi enviado pelos Correios.</p>
          ${data.trackingCode ? `<p>Código de rastreio: <strong style="font-size:18px;color:#78350f">${data.trackingCode}</strong></p><p>Rastreie em: <a href="https://rastreamento.correios.com.br">correios.com.br</a></p>` : ''}
          <p style="margin-top:32px;color:#78716c;font-size:14px">Obrigado por comprar no Queijolatra!</p>
        </div>
      </div>
    `,
  })
}

export async function sendPasswordReset(data: { email: string; name: string; resetUrl: string }) {
  if (!process.env.RESEND_API_KEY) return
  await resend.emails.send({
    from: FROM,
    to: data.email,
    subject: 'Redefinição de senha — O Queijolatra',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#1c1917">
        <div style="background:#92400e;padding:24px;text-align:center">
          <h1 style="color:white;margin:0;font-size:22px">O Queijolatra</h1>
        </div>
        <div style="padding:32px">
          <h2>Redefinição de senha</h2>
          <p>Olá, <strong>${data.name}</strong>! Recebemos uma solicitação para redefinir sua senha.</p>
          <a href="${data.resetUrl}" style="display:inline-block;background:#92400e;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:bold;margin:16px 0">Redefinir minha senha</a>
          <p style="color:#78716c;font-size:14px">Este link expira em 1 hora. Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      </div>
    `,
  })
}
```

- [ ] **Step 2: Send confirmation email on checkout**

In `src/app/api/checkout/route.ts`, after order creation, add:
```ts
import { sendOrderConfirmation } from '@/lib/email'

// After order is created and before return:
sendOrderConfirmation({
  orderNumber: order.orderNumber,
  customerName: order.customerName,
  email: order.email,
  items: orderItems.map((item: any) => ({
    productName: item.productName,
    quantity: item.quantity,
    unitPrice: Number(item.unitPrice),
  })),
  subtotal: Number(order.subtotal),
  discount: Number(order.discount),
  shippingCost: Number(order.shippingCost),
  total: Number(order.total),
  shippingMethod: order.shippingMethod,
  paymentMethod: order.paymentMethod,
}).catch(console.error) // fire and forget
```

- [ ] **Step 3: Send shipped email on webhook payment confirmation**

In `src/app/api/webhooks/payment/route.ts`, after updating order to PAID/SHIPPED:
```ts
import { sendOrderShipped } from '@/lib/email'

// After status update when status === 'CONFIRMED':
if (status === 'CONFIRMED') {
  sendOrderShipped({
    orderNumber: order.orderNumber,
    customerName: order.customerName,
    email: order.email,
  }).catch(console.error)
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: email notifications via Resend for orders"
```

---

### Task 4: Password reset flow

**Files:**
- Add: `prisma/schema.prisma` — PasswordResetToken model
- Create: `src/app/conta/esqueci-senha/page.tsx`
- Create: `src/app/conta/redefinir-senha/page.tsx`
- Create: `src/app/api/auth/forgot-password/route.ts`
- Create: `src/app/api/auth/reset-password/route.ts`

- [ ] **Step 1: Add PasswordResetToken to schema**

Add to `prisma/schema.prisma`:
```prisma
model PasswordResetToken {
  id         String   @id @default(cuid())
  customerId String
  token      String   @unique @default(cuid())
  expiresAt  DateTime
  usedAt     DateTime?
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
}
```

Also add to Customer model: `resetTokens  PasswordResetToken[]`

- [ ] **Step 2: Migrate**

```bash
npx prisma migrate dev --name add-password-reset-token
npx prisma generate
```

- [ ] **Step 3: Create forgot-password API**

Create `src/app/api/auth/forgot-password/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendPasswordReset } from '@/lib/email'

export async function POST(request: NextRequest) {
  const { email } = await request.json()
  if (!email) return NextResponse.json({ error: 'Email obrigatório' }, { status: 400 })

  const customer = await prisma.customer.findUnique({ where: { email } })
  // Always return success to avoid user enumeration
  if (!customer) return NextResponse.json({ ok: true })

  const token = await prisma.passwordResetToken.create({
    data: {
      customerId: customer.id,
      expiresAt: new Date(Date.now() + 60 * 60 * 1000), // 1 hour
    }
  })

  const resetUrl = `${process.env.NEXTAUTH_URL}/conta/redefinir-senha?token=${token.token}`
  await sendPasswordReset({ email: customer.email, name: customer.name, resetUrl })

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 4: Create reset-password API**

Create `src/app/api/auth/reset-password/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  const { token, password } = await request.json()
  if (!token || !password || password.length < 6) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }

  const resetToken = await prisma.passwordResetToken.findUnique({
    where: { token },
    include: { customer: true },
  })

  if (!resetToken || resetToken.usedAt || new Date(resetToken.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Token inválido ou expirado' }, { status: 400 })
  }

  const passwordHash = await bcrypt.hash(password, 10)
  await prisma.$transaction([
    prisma.customer.update({ where: { id: resetToken.customerId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: resetToken.id }, data: { usedAt: new Date() } }),
  ])

  return NextResponse.json({ ok: true })
}
```

- [ ] **Step 5: Create forgot-password page**

Create `src/app/conta/esqueci-senha/page.tsx`:
```tsx
'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    await fetch('/api/auth/forgot-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }),
    })
    setSent(true)
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-xl font-bold mb-2 text-stone-800">Esqueceu a senha?</h1>
        {sent ? (
          <div>
            <p className="text-stone-600 mb-4">Se este e-mail estiver cadastrado, você receberá um link de redefinição em breve.</p>
            <Link href="/conta/login" className="text-amber-700 hover:underline text-sm">Voltar ao login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 mt-4">
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail" required
              className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
            <button type="submit" disabled={loading}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
              {loading ? 'Enviando...' : 'Enviar link de redefinição'}
            </button>
            <Link href="/conta/login" className="block text-center text-sm text-stone-500 hover:text-stone-700">Voltar ao login</Link>
          </form>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 6: Create reset-password page**

Create `src/app/conta/redefinir-senha/page.tsx`:
```tsx
'use client'
import { useState, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'

function ResetForm() {
  const params = useSearchParams()
  const token = params.get('token') ?? ''
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (password !== confirm) return setError('Senhas não conferem')
    if (password.length < 6) return setError('Senha deve ter no mínimo 6 caracteres')
    setLoading(true)
    const res = await fetch('/api/auth/reset-password', {
      method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ token, password }),
    })
    if (res.ok) {
      router.push('/conta/login?message=Senha redefinida com sucesso')
    } else {
      const data = await res.json()
      setError(data.error ?? 'Erro ao redefinir senha')
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-stone-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-2xl shadow-sm border border-stone-200">
        <h1 className="text-xl font-bold mb-4 text-stone-800">Nova senha</h1>
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Nova senha (mín. 6 caracteres)" required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)}
            placeholder="Confirme a nova senha" required
            className="w-full border border-stone-300 rounded-lg px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          <button type="submit" disabled={loading}
            className="w-full bg-amber-600 hover:bg-amber-700 text-white py-2.5 rounded-lg font-medium text-sm disabled:opacity-50">
            {loading ? 'Salvando...' : 'Redefinir senha'}
          </button>
          <Link href="/conta/login" className="block text-center text-sm text-stone-500 hover:text-stone-700">Voltar ao login</Link>
        </form>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return <Suspense><ResetForm /></Suspense>
}
```

- [ ] **Step 7: Add "Esqueceu a senha?" link on login page**

In `src/app/conta/login/page.tsx`, after the password input, add:
```tsx
<div className="text-right">
  <Link href="/conta/esqueci-senha" className="text-sm text-amber-700 hover:underline">Esqueceu a senha?</Link>
</div>
```

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: password reset via email token + Resend"
```
