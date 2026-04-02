import Link from 'next/link'
import { prisma } from '@/lib/prisma'
import MobileMenu from './MobileMenu'

export default async function MainMenu() {
  let categories: Array<{ id: string; name: string; slug: string; children: Array<{ id: string; name: string; slug: string }> }> = []
  try {
    categories = await prisma.category.findMany({
      where: { parentId: null },
      orderBy: { position: 'asc' },
      include: {
        children: {
          orderBy: { position: 'asc' },
        },
      },
    })
  } catch {
    // DB unavailable during build or cold start
  }

  return (
    <>
      {/* Desktop menu */}
      <nav className="hidden md:block bg-stone-50 border-b border-stone-200" aria-label="Menu principal">
        <div className="max-w-7xl mx-auto px-4">
          <ul className="flex items-center gap-1" role="menubar">
            {categories.map((cat) => (
              <li key={cat.id} className="relative group" role="none">
                <Link
                  href={`/categoria/${cat.slug}`}
                  className="block px-4 py-3 text-sm font-medium text-stone-700 hover:text-amber-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-amber-500 focus-visible:ring-offset-2 rounded transition-colors"
                  role="menuitem"
                  aria-haspopup={cat.children.length > 0 ? 'true' : undefined}
                >
                  {cat.name}
                </Link>
                {cat.children.length > 0 && (
                  <div className="absolute left-0 top-full bg-white border border-stone-200 rounded-lg shadow-lg min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible group-focus-within:opacity-100 group-focus-within:visible transition-all duration-200 z-40" role="menu">
                    <ul className="py-2">
                      {cat.children.map((child) => (
                        <li key={child.id} role="none">
                          <Link
                            href={`/categoria/${child.slug}`}
                            className="block px-4 py-2 text-sm text-stone-600 hover:text-amber-700 hover:bg-stone-50 focus-visible:outline-none focus-visible:bg-amber-50 focus-visible:text-amber-700 transition-colors"
                            role="menuitem"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </li>
            ))}
          </ul>
        </div>
      </nav>

      {/* Mobile menu */}
      <MobileMenu categories={categories} />
    </>
  )
}
