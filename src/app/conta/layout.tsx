import Link from 'next/link'

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex gap-8">
      <aside className="w-48 shrink-0">
        <nav className="space-y-2">
          <Link href="/conta" className="block py-2 px-3 rounded hover:bg-amber-50 text-stone-700">Minha Conta</Link>
          <Link href="/conta/pedidos" className="block py-2 px-3 rounded hover:bg-amber-50 text-stone-700">Meus Pedidos</Link>
          <Link href="/conta/favoritos" className="block py-2 px-3 rounded hover:bg-amber-50 text-stone-700">Favoritos</Link>
        </nav>
      </aside>
      <main className="flex-1">{children}</main>
    </div>
  )
}
