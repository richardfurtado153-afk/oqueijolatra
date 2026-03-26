'use client'
import { useState } from 'react'
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
  { href: '/admin/relatorios', label: 'Relatorios', icon: '📈' },
]

export default function AdminSidebar() {
  const pathname = usePathname()
  const [open, setOpen] = useState(false)

  return (
    <>
      {/* Mobile toggle button */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed top-3 left-3 z-50 lg:hidden bg-stone-900 text-white p-2 rounded-lg shadow-lg"
        aria-label="Toggle menu"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          {open ? (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          ) : (
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          )}
        </svg>
      </button>

      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      <aside
        className={`fixed lg:static inset-y-0 left-0 z-40 w-56 min-h-screen bg-stone-900 text-white flex flex-col transition-transform duration-200 ${
          open ? 'translate-x-0' : '-translate-x-full'
        } lg:translate-x-0`}
      >
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
                onClick={() => setOpen(false)}
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
    </>
  )
}
