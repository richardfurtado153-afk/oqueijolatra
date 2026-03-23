# Product Reviews & Ratings Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a reviews and ratings system to product pages — customers who bought a product can leave a star rating and comment, visible to all visitors.

**Architecture:** New `Review` model in Prisma. API routes for submitting and fetching reviews. Server component displays reviews on product page. Only authenticated customers who have purchased the product can submit reviews (one review per product per customer).

**Tech Stack:** Prisma SQLite, Next.js Server Components + API routes.

---

## File Map

**New files:**
- `src/app/api/reviews/route.ts` — GET (list by product) + POST (submit review)
- `src/components/product/ProductReviews.tsx` — Reviews section with rating display + submit form

**Modified files:**
- `prisma/schema.prisma` — add Review model
- `src/app/(store)/produto/[slug]/page.tsx` — add `<ProductReviews>` below product info
- `src/app/api/products/[slug]/route.ts` — include avg rating in product response

---

### Task 1: Add Review model to schema

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Add Review model**

Add to `prisma/schema.prisma`:
```prisma
model Review {
  id         String   @id @default(cuid())
  productId  String
  product    Product  @relation(fields: [productId], references: [id], onDelete: Cascade)
  customerId String
  customer   Customer @relation(fields: [customerId], references: [id], onDelete: Cascade)
  rating     Int      // 1-5
  title      String?
  body       String
  createdAt  DateTime @default(now())

  @@unique([productId, customerId])
}
```

Also add to Product model: `reviews Review[]`
Also add to Customer model: `reviews Review[]`

- [ ] **Step 2: Migrate and regenerate**

```bash
cd /Users/richardfurtado/Downloads/oqueijolatra
npx prisma migrate dev --name add-reviews
npx prisma generate
```
Expected: Migration applied, `src/generated/prisma/` updated.

- [ ] **Step 3: Commit**

```bash
git add prisma/
git commit -m "feat: add Review model to schema"
```

---

### Task 2: Reviews API

**Files:**
- Create: `src/app/api/reviews/route.ts`

- [ ] **Step 1: Create reviews route**

Create `src/app/api/reviews/route.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  const productId = request.nextUrl.searchParams.get('productId')
  if (!productId) return NextResponse.json({ error: 'productId required' }, { status: 400 })

  const reviews = await prisma.review.findMany({
    where: { productId },
    orderBy: { createdAt: 'desc' },
    include: { customer: { select: { name: true } } },
  })

  const avg = reviews.length > 0
    ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
    : 0

  return NextResponse.json({ reviews, avg: Math.round(avg * 10) / 10, total: reviews.length })
}

export async function POST(request: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Faça login para avaliar' }, { status: 401 })
  }

  const customerId = session.user.id as string
  const { productId, rating, title, body } = await request.json()

  if (!productId || !rating || rating < 1 || rating > 5) {
    return NextResponse.json({ error: 'Dados inválidos' }, { status: 400 })
  }
  if (!body || body.trim().length < 10) {
    return NextResponse.json({ error: 'O comentário deve ter pelo menos 10 caracteres' }, { status: 400 })
  }

  // Check if customer bought this product
  const hasPurchased = await prisma.orderItem.findFirst({
    where: {
      productId,
      order: { customerId, paymentStatus: 'CONFIRMED' }
    }
  })
  if (!hasPurchased) {
    return NextResponse.json({ error: 'Apenas clientes que compraram o produto podem avaliar' }, { status: 403 })
  }

  try {
    const review = await prisma.review.create({
      data: { productId, customerId, rating, title: title?.trim() || null, body: body.trim() },
      include: { customer: { select: { name: true } } },
    })
    return NextResponse.json(review, { status: 201 })
  } catch (e: any) {
    if (e.code === 'P2002') {
      return NextResponse.json({ error: 'Você já avaliou este produto' }, { status: 409 })
    }
    throw e
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add -A
git commit -m "feat: reviews API with purchase verification"
```

---

### Task 3: ProductReviews component

**Files:**
- Create: `src/components/product/ProductReviews.tsx`
- Modify: `src/app/(store)/produto/[slug]/page.tsx`

- [ ] **Step 1: Create ProductReviews component**

Create `src/components/product/ProductReviews.tsx`:
```tsx
'use client'
import { useState, useEffect } from 'react'
import { useSession } from 'next-auth/react'

interface Review {
  id: string
  rating: number
  title?: string
  body: string
  createdAt: string
  customer: { name: string }
}

function Stars({ rating, size = 'sm' }: { rating: number; size?: 'sm' | 'lg' }) {
  const s = size === 'lg' ? 'text-2xl' : 'text-base'
  return (
    <span className={s} aria-label={`${rating} de 5 estrelas`}>
      {'★'.repeat(rating)}{'☆'.repeat(5 - rating)}
    </span>
  )
}

export default function ProductReviews({ productId }: { productId: string }) {
  const { data: session } = useSession()
  const [reviews, setReviews] = useState<Review[]>([])
  const [avg, setAvg] = useState(0)
  const [total, setTotal] = useState(0)
  const [showForm, setShowForm] = useState(false)
  const [rating, setRating] = useState(5)
  const [title, setTitle] = useState('')
  const [body, setBody] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  useEffect(() => {
    fetch(`/api/reviews?productId=${productId}`)
      .then((r) => r.json())
      .then((d) => { setReviews(d.reviews); setAvg(d.avg); setTotal(d.total) })
  }, [productId, success])

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    setError('')
    const res = await fetch('/api/reviews', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ productId, rating, title, body }),
    })
    if (res.ok) {
      setSuccess(true)
      setShowForm(false)
      setBody('')
      setTitle('')
    } else {
      const data = await res.json()
      setError(data.error)
    }
    setSubmitting(false)
  }

  return (
    <section className="mt-12 border-t border-stone-200 pt-10">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-stone-800">Avaliações dos clientes</h2>
          {total > 0 && (
            <div className="flex items-center gap-2 mt-1">
              <Stars rating={Math.round(avg)} size="lg" />
              <span className="text-stone-600 text-sm">{avg} de 5 ({total} avaliação{total !== 1 ? 'ões' : ''})</span>
            </div>
          )}
        </div>
        {session && !success && (
          <button onClick={() => setShowForm((v) => !v)}
            className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
            {showForm ? 'Cancelar' : 'Avaliar produto'}
          </button>
        )}
      </div>

      {!session && (
        <p className="text-sm text-stone-500 mb-4">
          <a href="/conta/login" className="text-amber-700 hover:underline">Faça login</a> para avaliar este produto.
        </p>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 mb-6 text-green-800 text-sm">
          Avaliação enviada com sucesso! Obrigado pelo feedback.
        </div>
      )}

      {showForm && (
        <form onSubmit={handleSubmit} className="bg-stone-50 rounded-xl p-6 border border-stone-200 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-2">Sua nota *</label>
            <div className="flex gap-1">
              {[1,2,3,4,5].map((n) => (
                <button key={n} type="button" onClick={() => setRating(n)}
                  className={`text-3xl transition-colors ${n <= rating ? 'text-amber-500' : 'text-stone-300'} hover:text-amber-400`}>
                  ★
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Título (opcional)</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Resumo da sua avaliação"
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Comentário * (mín. 10 caracteres)</label>
            <textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} required minLength={10}
              placeholder="Conte sua experiência com o produto..."
              className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500" />
          </div>
          {error && <p className="text-red-600 text-sm">{error}</p>}
          <button type="submit" disabled={submitting}
            className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium disabled:opacity-50">
            {submitting ? 'Enviando...' : 'Enviar avaliação'}
          </button>
        </form>
      )}

      {reviews.length === 0 ? (
        <p className="text-stone-400 text-sm">Seja o primeiro a avaliar este produto!</p>
      ) : (
        <div className="space-y-4">
          {reviews.map((r) => (
            <div key={r.id} className="bg-white rounded-xl p-5 border border-stone-200">
              <div className="flex items-center gap-3 mb-2">
                <Stars rating={r.rating} />
                <span className="text-stone-800 font-medium text-sm">{r.customer.name.split(' ')[0]}</span>
                <span className="text-stone-400 text-xs ml-auto">
                  {new Date(r.createdAt).toLocaleDateString('pt-BR')}
                </span>
              </div>
              {r.title && <p className="font-semibold text-stone-800 mb-1">{r.title}</p>}
              <p className="text-stone-600 text-sm leading-relaxed">{r.body}</p>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
```

- [ ] **Step 2: Add ProductReviews to product page**

In `src/app/(store)/produto/[slug]/page.tsx`, at the bottom of the page return, before closing tags, add:
```tsx
import ProductReviews from '@/components/product/ProductReviews'

// Inside the return, after RelatedProducts:
<div className="max-w-3xl mx-auto px-4">
  <ProductReviews productId={product.id} />
</div>
```

- [ ] **Step 3: Verify reviews section appears on product page**

Navigate to `http://localhost:3000/produto/[any-slug]` — the "Avaliações dos clientes" section should appear at the bottom.

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: product reviews and star ratings system"
```
