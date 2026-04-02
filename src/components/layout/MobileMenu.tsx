'use client'

import { useState } from 'react'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  slug: string
  children: Array<{ id: string; name: string; slug: string }>
}

interface MobileMenuProps {
  categories: Category[]
}

export default function MobileMenu({ categories }: MobileMenuProps) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  function toggleCategory(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  return (
    <div className="md:hidden border-b border-stone-200">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-sm font-medium text-stone-700 bg-stone-50 hover:bg-stone-100 transition-colors"
        aria-expanded={open}
        aria-controls="mobile-menu"
        aria-label="Menu de categorias"
      >
        <span className="flex items-center gap-2">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
          Categorias
        </span>
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className={`w-4 h-4 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      <nav
        id="mobile-menu"
        className={`overflow-hidden transition-all duration-300 ease-in-out ${
          open ? 'max-h-[80vh] opacity-100' : 'max-h-0 opacity-0'
        }`}
        aria-label="Menu de categorias mobile"
      >
        <ul className="bg-white divide-y divide-stone-100">
          {categories.map((cat) => (
            <li key={cat.id}>
              <div className="flex items-center">
                <Link
                  href={`/categoria/${cat.slug}`}
                  onClick={() => setOpen(false)}
                  className="flex-1 px-4 py-3 text-sm text-stone-700 hover:text-amber-700 transition-colors"
                >
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <button
                    onClick={() => toggleCategory(cat.id)}
                    className="px-4 py-3 text-stone-400 hover:text-stone-600 transition-colors"
                    aria-expanded={expandedId === cat.id}
                    aria-label={`Expandir ${cat.name}`}
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className={`w-4 h-4 transition-transform duration-200 ${expandedId === cat.id ? 'rotate-180' : ''}`}
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                )}
              </div>
              {cat.children.length > 0 && (
                <ul
                  className={`bg-stone-50 overflow-hidden transition-all duration-200 ${
                    expandedId === cat.id ? 'max-h-96' : 'max-h-0'
                  }`}
                >
                  {cat.children.map((child) => (
                    <li key={child.id}>
                      <Link
                        href={`/categoria/${child.slug}`}
                        onClick={() => setOpen(false)}
                        className="block pl-8 pr-4 py-2.5 text-sm text-stone-600 hover:text-amber-700 transition-colors"
                      >
                        {child.name}
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
