# Admin Panel Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a complete admin panel at `/admin` with CRUD for products, categories, brands, banners, coupons, and order management.

**Architecture:** Protected route group `/src/app/admin/` with middleware-based auth (isAdmin flag on Customer). Server components for data fetching, client components only for forms and interactive elements. All mutations via Server Actions.

**Tech Stack:** Next.js App Router, Prisma SQLite, Server Actions, Tailwind CSS, `sharp` for image resizing.

---

## File Map

**New files to create:**
- `prisma/schema.prisma` — add `isAdmin Boolean @default(false)` to Customer
- `src/middleware.ts` — protect `/admin/*` routes
- `src/app/admin/layout.tsx` — admin layout with sidebar
- `src/app/admin/page.tsx` — dashboard (stats)
- `src/app/admin/produtos/page.tsx` — product list
- `src/app/admin/produtos/novo/page.tsx` — create product form
- `src/app/admin/produtos/[id]/editar/page.tsx` — edit product form
- `src/app/admin/categorias/page.tsx` — category list + inline create/edit
- `src/app/admin/marcas/page.tsx` — brand list + inline create/edit
- `src/app/admin/banners/page.tsx` — banner list + create/edit
- `src/app/admin/cupons/page.tsx` — coupon list + create
- `src/app/admin/pedidos/page.tsx` — orders list with filters
- `src/app/admin/pedidos/[id]/page.tsx` — order detail + status update
- `src/app/admin/actions/products.ts` — Server Actions for product CRUD
- `src/app/admin/actions/categories.ts` — Server Actions for category CRUD
- `src/app/admin/actions/brands.ts` — Server Actions for brand CRUD
- `src/app/admin/actions/banners.ts` — Server Actions for banner CRUD
- `src/app/admin/actions/coupons.ts` — Server Actions for coupon CRUD
- `src/app/admin/actions/orders.ts` — Server Actions for order status
- `src/app/admin/components/AdminSidebar.tsx` — sidebar nav
- `src/app/admin/components/AdminStats.tsx` — dashboard stats cards
- `src/app/admin/components/ProductForm.tsx` — shared create/edit form
- `src/app/admin/components/ImageUpload.tsx` — image upload with preview
- `src/lib/auth.ts` — add `isAdmin` to session type

**Modified files:**
- `prisma/schema.prisma` — add `isAdmin` field to Customer
- `prisma/seed.ts` — set admin user `isAdmin: true`
- `src/lib/auth.ts` — expose `isAdmin` in session callbacks
- `next.config.ts` — ensure `/public/uploads` is writable

---

### Task 1: Add isAdmin to schema and protect /admin routes

**Files:**
- Modify: `prisma/schema.prisma` (Customer model)
- Create: `src/middleware.ts`
- Modify: `prisma/seed.ts`
- Modify: `src/lib/auth.ts`

- [ ] **Step 1: Add isAdmin to Customer in schema**

In `prisma/schema.prisma`, add to the Customer model after `passwordHash String`:
```prisma
isAdmin      Boolean           @default(false)
```

- [ ] **Step 2: Run migration**

```bash
cd /Users/richardfurtado/Downloads/oqueijolatra
npx prisma migrate dev --name add-isadmin
```
Expected: Migration created and applied. `dev.db` updated.

- [ ] **Step 3: Regenerate Prisma client**

```bash
npx prisma generate
```
Expected: `src/generated/prisma/` updated.

- [ ] **Step 4: Update auth.ts to expose isAdmin in session**

In `src/lib/auth.ts`, in the `jwt` callback, after setting `token.id`:
```ts
token.isAdmin = (user as any).isAdmin ?? false
```
In the `session` callback, after setting `session.user.id`:
```ts
(session.user as any).isAdmin = token.isAdmin
```

- [ ] **Step 5: Update seed to create admin user**

In `prisma/seed.ts`, before `console.log('Seeding complete!')`, add:
```ts
import bcrypt from 'bcryptjs'
// Create admin user
const existingAdmin = await prisma.customer.findUnique({ where: { email: 'admin@queijolatra.com.br' } })
if (!existingAdmin) {
  await prisma.customer.create({
    data: {
      name: 'Administrador',
      email: 'admin@queijolatra.com.br',
      passwordHash: await bcrypt.hash('admin123456', 10),
      isAdmin: true,
    },
  })
  console.log('Admin user created: admin@queijolatra.com.br / admin123456')
}
```

- [ ] **Step 6: Create middleware.ts to protect /admin**

Create `src/middleware.ts`:
```ts
import { NextRequest, NextResponse } from 'next/server'
import { getToken } from 'next-auth/jwt'

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  if (pathname.startsWith('/admin')) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      return NextResponse.redirect(new URL('/conta/login?callbackUrl=/admin', request.url))
    }
    if (!token.isAdmin) {
      return NextResponse.redirect(new URL('/', request.url))
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/admin/:path*'],
}
```

- [ ] **Step 7: Re-run seed**

```bash
npx tsx prisma/seed.ts
```
Expected: `Admin user created: admin@queijolatra.com.br / admin123456`

- [ ] **Step 8: Commit**

```bash
cd /Users/richardfurtado/Downloads/oqueijolatra
git add -A
git commit -m "feat: add isAdmin to Customer, protect /admin with middleware"
```

---

### Task 2: Admin layout and sidebar

**Files:**
- Create: `src/app/admin/layout.tsx`
- Create: `src/app/admin/components/AdminSidebar.tsx`

- [ ] **Step 1: Create AdminSidebar component**

Create `src/app/admin/components/AdminSidebar.tsx`:
```tsx
'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

const links = [
  { href: '/admin', label: 'Dashboard', icon: '📊' },
  { href: '/admin/pedidos', label: 'Pedidos', icon: '📦' },
  { href: '/admin/produtos', label: 'Produtos', icon: '🧀' },
  { href: '/admin/categorias', label: 'Categorias', icon: '📂' },
  { href: '/admin/marcas', label: 'Marcas', icon: '🏷️' },
  { href: '/admin/banners', label: 'Banners', icon: '🖼️' },
  { href: '/admin/cupons', label: 'Cupons', icon: '🎫' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  return (
    <aside className="w-56 min-h-screen bg-stone-900 text-white flex flex-col">
      <div className="px-4 py-6 border-b border-stone-700">
        <span className="text-amber-400 font-bold text-lg">Admin Panel</span>
        <div className="text-stone-400 text-xs mt-1">O Queijolatra</div>
      </div>
      <nav className="flex-1 py-4">
        {links.map((l) => {
          const active = l.href === '/admin' ? pathname === '/admin' : pathname.startsWith(l.href)
          return (
            <Link
              key={l.href}
              href={l.href}
              className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                active ? 'bg-amber-700 text-white' : 'text-stone-300 hover:bg-stone-800'
              }`}
            >
              <span>{l.icon}</span>
              {l.label}
            </Link>
          )
        })}
      </nav>
      <div className="px-4 py-4 border-t border-stone-700">
        <Link href="/" className="text-stone-400 hover:text-white text-xs">← Ver loja</Link>
      </div>
    </aside>
  )
}
```

- [ ] **Step 2: Create admin layout**

Create `src/app/admin/layout.tsx`:
```tsx
import AdminSidebar from './components/AdminSidebar'

export const metadata = { title: 'Admin — O Queijolatra' }

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-stone-100">
      <AdminSidebar />
      <main className="flex-1 p-8 overflow-auto">
        {children}
      </main>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin layout with sidebar navigation"
```

---

### Task 3: Admin dashboard (stats)

**Files:**
- Create: `src/app/admin/page.tsx`

- [ ] **Step 1: Create dashboard page**

Create `src/app/admin/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'

export default async function AdminDashboard() {
  const [totalOrders, totalRevenue, totalProducts, totalCustomers, pendingOrders] = await Promise.all([
    prisma.order.count(),
    prisma.order.aggregate({ where: { paymentStatus: 'CONFIRMED' }, _sum: { total: true } }),
    prisma.product.count(),
    prisma.customer.count({ where: { isAdmin: false } }),
    prisma.order.count({ where: { status: 'PENDING' } }),
  ])

  const revenueValue = Number(totalRevenue._sum.total ?? 0)

  const stats = [
    { label: 'Pedidos Total', value: totalOrders, color: 'bg-blue-500' },
    { label: 'Pedidos Pendentes', value: pendingOrders, color: 'bg-amber-500' },
    { label: 'Receita Confirmada', value: `R$ ${revenueValue.toFixed(2).replace('.', ',')}`, color: 'bg-green-500' },
    { label: 'Produtos', value: totalProducts, color: 'bg-purple-500' },
    { label: 'Clientes', value: totalCustomers, color: 'bg-pink-500' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Dashboard</h1>
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <div className={`w-3 h-3 rounded-full ${s.color} mb-3`} />
            <div className="text-2xl font-bold text-stone-800">{s.value}</div>
            <div className="text-sm text-stone-500 mt-1">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  )
}
```

- [ ] **Step 2: Verify dashboard loads**

Start the dev server and navigate to `http://localhost:3000/admin` — should redirect to login if not authenticated, or show dashboard with stats cards.

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin dashboard with stats"
```

---

### Task 4: Orders management page

**Files:**
- Create: `src/app/admin/pedidos/page.tsx`
- Create: `src/app/admin/pedidos/[id]/page.tsx`
- Create: `src/app/admin/actions/orders.ts`

- [ ] **Step 1: Create order status action**

Create `src/app/admin/actions/orders.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function updateOrderStatus(orderId: string, status: string) {
  await prisma.order.update({ where: { id: orderId }, data: { status: status as any } })
  revalidatePath('/admin/pedidos')
  revalidatePath(`/admin/pedidos/${orderId}`)
}
```

- [ ] **Step 2: Create orders list page**

Create `src/app/admin/pedidos/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'

const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', PAID: 'Pago', PROCESSING: 'Processando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}
const STATUS_COLORS: Record<string, string> = {
  PENDING: 'bg-yellow-100 text-yellow-800', PAID: 'bg-green-100 text-green-800',
  PROCESSING: 'bg-blue-100 text-blue-800', SHIPPED: 'bg-purple-100 text-purple-800',
  DELIVERED: 'bg-emerald-100 text-emerald-800', CANCELLED: 'bg-red-100 text-red-800',
}

export default async function AdminOrders({ searchParams }: { searchParams: Promise<{ status?: string }> }) {
  const { status } = await searchParams
  const orders = await prisma.order.findMany({
    where: status ? { status: status as any } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { items: { select: { quantity: true } } },
  })

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Pedidos</h1>
      <div className="flex gap-2 mb-4 flex-wrap">
        {['', 'PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED'].map((s) => (
          <Link key={s} href={s ? `/admin/pedidos?status=${s}` : '/admin/pedidos'}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${
              (status ?? '') === s ? 'bg-amber-600 text-white border-amber-600' : 'bg-white text-stone-600 border-stone-200 hover:border-amber-400'
            }`}>
            {s ? STATUS_LABELS[s] : 'Todos'}
          </Link>
        ))}
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {['Pedido', 'Data', 'Cliente', 'Total', 'Pagamento', 'Status', 'Ação'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-stone-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => (
              <tr key={o.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3 font-mono">#{o.orderNumber}</td>
                <td className="px-4 py-3 text-stone-500">{new Date(o.createdAt).toLocaleDateString('pt-BR')}</td>
                <td className="px-4 py-3">{o.customerName}</td>
                <td className="px-4 py-3 font-medium">R$ {Number(o.total).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">{o.paymentMethod}</td>
                <td className="px-4 py-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${STATUS_COLORS[o.status]}`}>
                    {STATUS_LABELS[o.status]}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <Link href={`/admin/pedidos/${o.id}`} className="text-amber-700 hover:underline">Ver</Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {orders.length === 0 && (
          <div className="text-center py-12 text-stone-400">Nenhum pedido encontrado</div>
        )}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Create order detail page**

Create `src/app/admin/pedidos/[id]/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateOrderStatus } from '../../actions/orders'

const STATUS_LIST = ['PENDING', 'PAID', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED']
const STATUS_LABELS: Record<string, string> = {
  PENDING: 'Pendente', PAID: 'Pago', PROCESSING: 'Processando',
  SHIPPED: 'Enviado', DELIVERED: 'Entregue', CANCELLED: 'Cancelado',
}

export default async function AdminOrderDetail({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const order = await prisma.order.findUnique({ where: { id }, include: { items: true } })
  if (!order) notFound()

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-1">Pedido #{order.orderNumber}</h1>
      <p className="text-stone-500 mb-6">{new Date(order.createdAt).toLocaleString('pt-BR')}</p>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <h2 className="font-semibold mb-3 text-stone-700">Cliente</h2>
          <p>{order.customerName}</p>
          <p className="text-stone-500">{order.email}</p>
          <p className="text-stone-500">{order.phone}</p>
          <p className="text-stone-500 text-sm mt-2">CPF: {order.cpf}</p>
        </div>
        <div className="bg-white rounded-xl p-5 border border-stone-200">
          <h2 className="font-semibold mb-3 text-stone-700">Entrega</h2>
          <p>{order.shippingStreet}, {order.shippingNumber}</p>
          <p>{order.shippingNeighborhood}</p>
          <p>{order.shippingCity} - {order.shippingState}</p>
          <p>CEP: {order.shippingCep}</p>
          <p className="text-stone-500 text-sm mt-2">{order.shippingMethod} — R$ {Number(order.shippingCost).toFixed(2).replace('.', ',')}</p>
        </div>
      </div>

      <div className="bg-white rounded-xl border border-stone-200 mb-6">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3">Produto</th>
              <th className="text-right px-4 py-3">Qtd</th>
              <th className="text-right px-4 py-3">Unitário</th>
              <th className="text-right px-4 py-3">Total</th>
            </tr>
          </thead>
          <tbody>
            {order.items.map((item) => (
              <tr key={item.id} className="border-b border-stone-100">
                <td className="px-4 py-3">{item.productName}{item.variationName ? ` — ${item.variationName}` : ''}</td>
                <td className="px-4 py-3 text-right">{item.quantity}</td>
                <td className="px-4 py-3 text-right">R$ {Number(item.unitPrice).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3 text-right font-medium">R$ {Number(item.totalPrice).toFixed(2).replace('.', ',')}</td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-stone-50">
            <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Subtotal</td><td className="px-4 py-2 text-right">R$ {Number(order.subtotal).toFixed(2).replace('.', ',')}</td></tr>
            {Number(order.discount) > 0 && <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Desconto</td><td className="px-4 py-2 text-right text-green-600">-R$ {Number(order.discount).toFixed(2).replace('.', ',')}</td></tr>}
            <tr><td colSpan={3} className="px-4 py-2 text-right text-stone-500">Frete</td><td className="px-4 py-2 text-right">R$ {Number(order.shippingCost).toFixed(2).replace('.', ',')}</td></tr>
            <tr><td colSpan={3} className="px-4 py-3 text-right font-bold">Total</td><td className="px-4 py-3 text-right font-bold text-lg">R$ {Number(order.total).toFixed(2).replace('.', ',')}</td></tr>
          </tfoot>
        </table>
      </div>

      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-3 text-stone-700">Atualizar Status</h2>
        <form className="flex gap-3">
          <input type="hidden" name="orderId" value={order.id} />
          <select name="status" defaultValue={order.status}
            className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1">
            {STATUS_LIST.map((s) => <option key={s} value={s}>{STATUS_LABELS[s]}</option>)}
          </select>
          <button formAction={async (fd: FormData) => {
            'use server'
            await updateOrderStatus(fd.get('orderId') as string, fd.get('status') as string)
          }} className="bg-amber-600 hover:bg-amber-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition-colors">
            Salvar
          </button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Commit**

```bash
git add -A
git commit -m "feat: admin orders list and detail with status update"
```

---

### Task 5: Product list and delete

**Files:**
- Create: `src/app/admin/produtos/page.tsx`
- Create: `src/app/admin/actions/products.ts` (initial with deleteProduct)

- [ ] **Step 1: Create products server action (delete)**

Create `src/app/admin/actions/products.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function deleteProduct(productId: string) {
  await prisma.product.delete({ where: { id: productId } })
  revalidatePath('/admin/produtos')
}

export async function createProduct(fd: FormData) {
  const slug = (fd.get('name') as string)
    .toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

  await prisma.product.create({
    data: {
      name: fd.get('name') as string,
      slug,
      sku: fd.get('sku') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      compareAtPrice: fd.get('compareAtPrice') ? parseFloat(fd.get('compareAtPrice') as string) : null,
      stock: parseInt(fd.get('stock') as string) || 0,
      weight: parseFloat(fd.get('weight') as string) || 0.5,
      categoryId: fd.get('categoryId') as string,
      brandId: fd.get('brandId') as string || null,
      featured: fd.get('featured') === 'on',
      isBestseller: fd.get('isBestseller') === 'on',
      isNew: fd.get('isNew') === 'on',
      images: fd.get('imageUrl') ? {
        create: { url: fd.get('imageUrl') as string, isMain: true, position: 0 }
      } : undefined,
    },
  })
  redirect('/admin/produtos')
}

export async function updateProduct(productId: string, fd: FormData) {
  await prisma.product.update({
    where: { id: productId },
    data: {
      name: fd.get('name') as string,
      sku: fd.get('sku') as string,
      description: fd.get('description') as string,
      price: parseFloat(fd.get('price') as string),
      compareAtPrice: fd.get('compareAtPrice') ? parseFloat(fd.get('compareAtPrice') as string) : null,
      stock: parseInt(fd.get('stock') as string) || 0,
      weight: parseFloat(fd.get('weight') as string) || 0.5,
      categoryId: fd.get('categoryId') as string,
      brandId: fd.get('brandId') as string || null,
      featured: fd.get('featured') === 'on',
      isBestseller: fd.get('isBestseller') === 'on',
      isNew: fd.get('isNew') === 'on',
    },
  })
  redirect('/admin/produtos')
}
```

- [ ] **Step 2: Create products list page**

Create `src/app/admin/produtos/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { deleteProduct } from '../actions/products'

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { images: { where: { isMain: true }, take: 1 }, category: true, brand: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Produtos ({products.length})</h1>
        <Link href="/admin/produtos/novo" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Novo Produto
        </Link>
      </div>
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar produto..." className="border border-stone-300 rounded-lg px-4 py-2 w-80 text-sm" />
        <button className="ml-2 bg-stone-200 hover:bg-stone-300 px-4 py-2 rounded-lg text-sm">Buscar</button>
      </form>
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {['Foto', 'Nome', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Ações'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-stone-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  ) : <div className="w-10 h-10 bg-stone-200 rounded" />}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-stone-500">{p.sku}</td>
                <td className="px-4 py-3 text-stone-500">{p.category.name}</td>
                <td className="px-4 py-3">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">
                  <span className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>{p.stock}</span>
                </td>
                <td className="px-4 py-3 flex gap-3">
                  <Link href={`/admin/produtos/${p.id}/editar`} className="text-amber-700 hover:underline">Editar</Link>
                  <form action={deleteProduct.bind(null, p.id)}>
                    <button className="text-red-500 hover:underline" onClick={(e) => { if (!confirm('Excluir produto?')) e.preventDefault() }}>
                      Excluir
                    </button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="text-center py-12 text-stone-400">Nenhum produto encontrado</div>}
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin product list with search and delete"
```

---

### Task 6: Create and Edit product form

**Files:**
- Create: `src/app/admin/produtos/novo/page.tsx`
- Create: `src/app/admin/produtos/[id]/editar/page.tsx`

- [ ] **Step 1: Create "Novo Produto" page**

Create `src/app/admin/produtos/novo/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { createProduct } from '../../actions/products'

export default async function AdminNewProduct() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: 'asc' }, include: { children: true } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Novo Produto</h1>
      <form action={createProduct} className="space-y-4 bg-white rounded-xl p-6 border border-stone-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
            <input name="name" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">SKU *</label>
            <input name="sku" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$) *</label>
            <input name="price" type="number" step="0.01" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço Antigo (R$)</label>
            <input name="compareAtPrice" type="number" step="0.01" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
            <input name="stock" type="number" defaultValue="100" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Peso (kg)</label>
            <input name="weight" type="number" step="0.01" defaultValue="0.5" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Categoria *</label>
            <select name="categoryId" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {c.children.map((sub) => <option key={sub.id} value={sub.id}>  {sub.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Marca</label>
            <select name="brandId" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Sem marca</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">URL da Imagem Principal</label>
            <input name="imageUrl" type="url" placeholder="https://..." className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descrição *</label>
            <textarea name="description" rows={4} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isNew" /> Lançamento</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isBestseller" /> Mais Vendido</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Destaque</label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Criar Produto</button>
          <a href="/admin/produtos" className="bg-stone-200 hover:bg-stone-300 px-6 py-2 rounded-lg text-sm font-medium">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 2: Create Edit product page**

Create `src/app/admin/produtos/[id]/editar/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { notFound } from 'next/navigation'
import { updateProduct } from '../../../actions/products'

export default async function AdminEditProduct({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const [product, categories, brands] = await Promise.all([
    prisma.product.findUnique({ where: { id }, include: { images: { where: { isMain: true }, take: 1 } } }),
    prisma.category.findMany({ where: { parentId: null }, orderBy: { name: 'asc' }, include: { children: true } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])
  if (!product) notFound()

  const action = updateProduct.bind(null, id)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Editar: {product.name}</h1>
      <form action={action} className="space-y-4 bg-white rounded-xl p-6 border border-stone-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
            <input name="name" defaultValue={product.name} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">SKU *</label>
            <input name="sku" defaultValue={product.sku} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$) *</label>
            <input name="price" type="number" step="0.01" defaultValue={Number(product.price)} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço Antigo (R$)</label>
            <input name="compareAtPrice" type="number" step="0.01" defaultValue={product.compareAtPrice ? Number(product.compareAtPrice) : ''} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
            <input name="stock" type="number" defaultValue={product.stock} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Peso (kg)</label>
            <input name="weight" type="number" step="0.01" defaultValue={Number(product.weight)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Categoria *</label>
            <select name="categoryId" defaultValue={product.categoryId} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              {categories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {c.children.map((sub) => <option key={sub.id} value={sub.id}>  {sub.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Marca</label>
            <select name="brandId" defaultValue={product.brandId ?? ''} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Sem marca</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descrição *</label>
            <textarea name="description" rows={4} defaultValue={product.description} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isNew" defaultChecked={product.isNew} /> Lançamento</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isBestseller" defaultChecked={product.isBestseller} /> Mais Vendido</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" defaultChecked={product.featured} /> Destaque</label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Salvar</button>
          <a href="/admin/produtos" className="bg-stone-200 hover:bg-stone-300 px-6 py-2 rounded-lg text-sm font-medium">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin create and edit product forms"
```

---

### Task 7: Categories, Brands, and Banners management

**Files:**
- Create: `src/app/admin/categorias/page.tsx`
- Create: `src/app/admin/marcas/page.tsx`
- Create: `src/app/admin/banners/page.tsx`
- Create: `src/app/admin/actions/categories.ts`
- Create: `src/app/admin/actions/brands.ts`
- Create: `src/app/admin/actions/banners.ts`

- [ ] **Step 1: Category actions**

Create `src/app/admin/actions/categories.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCategory(fd: FormData) {
  const name = fd.get('name') as string
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  await prisma.category.create({
    data: { name, slug, parentId: fd.get('parentId') as string || null }
  })
  revalidatePath('/admin/categorias')
}

export async function deleteCategory(id: string) {
  await prisma.category.delete({ where: { id } })
  revalidatePath('/admin/categorias')
}
```

- [ ] **Step 2: Category page**

Create `src/app/admin/categorias/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { createCategory, deleteCategory } from '../actions/categories'

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  const roots = categories.filter((c) => !c.parentId)
  const children = categories.filter((c) => c.parentId)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Categorias</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr><th className="text-left px-4 py-3">Nome</th><th className="text-left px-4 py-3">Slug</th><th className="text-right px-4 py-3">Produtos</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {roots.map((c) => (
              <>
                <tr key={c.id} className="border-b border-stone-100 bg-stone-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{c._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCategory.bind(null, c.id)} className="inline">
                      <button className="text-red-500 hover:underline text-xs">Excluir</button>
                    </form>
                  </td>
                </tr>
                {children.filter((ch) => ch.parentId === c.id).map((ch) => (
                  <tr key={ch.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 pl-8 text-stone-600">└ {ch.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{ch.slug}</td>
                    <td className="px-4 py-3 text-right">{ch._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteCategory.bind(null, ch.id)} className="inline">
                        <button className="text-red-500 hover:underline text-xs">Excluir</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Nova Categoria</h2>
        <form action={createCategory} className="flex gap-3">
          <input name="name" placeholder="Nome" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1" />
          <select name="parentId" className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Categoria raiz</option>
            {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar</button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Brand actions and page**

Create `src/app/admin/actions/brands.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createBrand(fd: FormData) {
  const name = fd.get('name') as string
  const slug = name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-')
  await prisma.brand.create({ data: { name, slug, logoUrl: fd.get('logoUrl') as string || null } })
  revalidatePath('/admin/marcas')
}

export async function deleteBrand(id: string) {
  await prisma.brand.delete({ where: { id } })
  revalidatePath('/admin/marcas')
}
```

Create `src/app/admin/marcas/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { createBrand, deleteBrand } from '../actions/brands'

export default async function AdminBrands() {
  const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' }, include: { _count: { select: { products: true } } } })
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Marcas</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr><th className="text-left px-4 py-3">Nome</th><th className="text-left px-4 py-3">Slug</th><th className="text-right px-4 py-3">Produtos</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{b.slug}</td>
                <td className="px-4 py-3 text-right">{b._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteBrand.bind(null, b.id)} className="inline">
                    <button className="text-red-500 hover:underline text-xs">Excluir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Nova Marca</h2>
        <form action={createBrand} className="space-y-3">
          <input name="name" placeholder="Nome da marca" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="logoUrl" placeholder="URL do logo (opcional)" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar</button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 4: Banner actions and page**

Create `src/app/admin/actions/banners.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createBanner(fd: FormData) {
  await prisma.banner.create({
    data: {
      title: fd.get('title') as string,
      imageUrl: fd.get('imageUrl') as string,
      link: fd.get('link') as string,
      position: parseInt(fd.get('position') as string) || 0,
      active: fd.get('active') === 'on',
    }
  })
  revalidatePath('/admin/banners')
}

export async function toggleBanner(id: string, active: boolean) {
  await prisma.banner.update({ where: { id }, data: { active } })
  revalidatePath('/admin/banners')
}

export async function deleteBanner(id: string) {
  await prisma.banner.delete({ where: { id } })
  revalidatePath('/admin/banners')
}
```

Create `src/app/admin/banners/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { createBanner, deleteBanner, toggleBanner } from '../actions/banners'

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } })
  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Banners</h1>
      <div className="space-y-3 mb-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-xl p-4 border border-stone-200 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt={b.title} className="w-24 h-14 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-stone-500">{b.link}</div>
              <div className="text-xs text-stone-400">Posição: {b.position}</div>
            </div>
            <div className="flex gap-3 items-center">
              <form action={toggleBanner.bind(null, b.id, !b.active)}>
                <button className={`px-3 py-1 rounded-full text-xs font-medium ${b.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {b.active ? 'Ativo' : 'Inativo'}
                </button>
              </form>
              <form action={deleteBanner.bind(null, b.id)}>
                <button className="text-red-500 hover:underline text-sm">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-stone-400 text-center py-8">Nenhum banner</p>}
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Novo Banner</h2>
        <form action={createBanner} className="space-y-3">
          <input name="title" placeholder="Título" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="imageUrl" placeholder="URL da imagem" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="link" placeholder="Link (ex: /queijos)" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <input name="position" type="number" placeholder="Posição" defaultValue="0" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Ativo</label>
          </div>
          <button className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar Banner</button>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: admin categories, brands, and banners management"
```

---

### Task 8: Coupon management

**Files:**
- Create: `src/app/admin/cupons/page.tsx`
- Create: `src/app/admin/actions/coupons.ts`

- [ ] **Step 1: Coupon actions**

Create `src/app/admin/actions/coupons.ts`:
```ts
'use server'
import { prisma } from '@/lib/prisma'
import { revalidatePath } from 'next/cache'

export async function createCoupon(fd: FormData) {
  const type = fd.get('type') as 'PERCENT' | 'FIXED'
  await prisma.coupon.create({
    data: {
      code: (fd.get('code') as string).toUpperCase(),
      type,
      discountPercent: type === 'PERCENT' ? parseInt(fd.get('discountValue') as string) : null,
      discountValue: type === 'FIXED' ? parseFloat(fd.get('discountValue') as string) : null,
      minOrderValue: fd.get('minOrderValue') ? parseFloat(fd.get('minOrderValue') as string) : null,
      usageLimit: fd.get('usageLimit') ? parseInt(fd.get('usageLimit') as string) : null,
      validFrom: new Date(fd.get('validFrom') as string),
      validUntil: new Date(fd.get('validUntil') as string),
      active: true,
    }
  })
  revalidatePath('/admin/cupons')
}

export async function toggleCoupon(id: string, active: boolean) {
  await prisma.coupon.update({ where: { id }, data: { active } })
  revalidatePath('/admin/cupons')
}
```

- [ ] **Step 2: Coupon page**

Create `src/app/admin/cupons/page.tsx`:
```tsx
import { prisma } from '@/lib/prisma'
import { createCoupon, toggleCoupon } from '../actions/coupons'

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { createdAt: 'desc' } ?? { validUntil: 'desc' } })
  const now = new Date()

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Cupons</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr><th className="text-left px-4 py-3">Código</th><th className="text-left px-4 py-3">Tipo</th><th className="text-left px-4 py-3">Desconto</th><th className="text-left px-4 py-3">Uso</th><th className="text-left px-4 py-3">Validade</th><th className="px-4 py-3"></th></tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = new Date(c.validUntil) < now
              return (
                <tr key={c.id} className={`border-b border-stone-100 ${expired ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.type === 'PERCENT' ? `${c.discountPercent}%` : `R$ ${Number(c.discountValue).toFixed(2)}`}</td>
                  <td className="px-4 py-3">{c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                  <td className="px-4 py-3 text-xs">{new Date(c.validUntil).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                      <button className={`px-2 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="text-center py-8 text-stone-400">Nenhum cupom</div>}
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Novo Cupom</h2>
        <form action={createCoupon} className="grid grid-cols-2 gap-3">
          <input name="code" placeholder="Código (ex: NATAL20)" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm uppercase" />
          <select name="type" className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
            <option value="PERCENT">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
          <input name="discountValue" type="number" step="0.01" placeholder="Valor do desconto" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="minOrderValue" type="number" step="0.01" placeholder="Pedido mínimo (R$)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="usageLimit" type="number" placeholder="Limite de usos (vazio = ilimitado)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <div />
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Válido a partir de</label>
            <input name="validFrom" type="date" required defaultValue={new Date().toISOString().slice(0,10)} className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Válido até</label>
            <input name="validUntil" type="date" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Criar Cupom</button>
          </div>
        </form>
      </div>
    </div>
  )
}
```

- [ ] **Step 3: Commit**

```bash
git add -A
git commit -m "feat: admin coupon management"
```
