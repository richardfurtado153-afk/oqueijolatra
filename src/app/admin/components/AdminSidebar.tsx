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
