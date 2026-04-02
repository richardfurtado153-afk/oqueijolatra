import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  robots: { index: false, follow: false },
}

export default function AccountLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col md:flex-row gap-6 md:gap-8">
      <aside className="w-full md:w-48 shrink-0">
        <nav className="flex md:flex-col gap-1 overflow-x-auto md:overflow-visible pb-2 md:pb-0 -mx-1 md:mx-0" aria-label="Menu da conta">
          <Link href="/conta" className="whitespace-nowrap block py-2 px-3 rounded-lg hover:bg-amber-50 text-stone-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Minha Conta
          </Link>
          <Link href="/conta/pedidos" className="whitespace-nowrap block py-2 px-3 rounded-lg hover:bg-amber-50 text-stone-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Meus Pedidos
          </Link>
          <Link href="/conta/favoritos" className="whitespace-nowrap block py-2 px-3 rounded-lg hover:bg-amber-50 text-stone-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Favoritos
          </Link>
          <Link href="/conta/enderecos" className="whitespace-nowrap block py-2 px-3 rounded-lg hover:bg-amber-50 text-stone-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Enderecos
          </Link>
          <Link href="/conta/perfil" className="whitespace-nowrap block py-2 px-3 rounded-lg hover:bg-amber-50 text-stone-700 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500">
            Perfil
          </Link>
        </nav>
      </aside>
      <main className="flex-1 min-w-0">{children}</main>
    </div>
  )
}
