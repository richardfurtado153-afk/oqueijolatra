import Link from 'next/link'
import { prisma } from '@/lib/prisma'

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
    <nav className="bg-stone-50 border-b border-stone-200">
      <div className="max-w-7xl mx-auto px-4">
        <ul className="flex items-center gap-1">
          {categories.map((cat) => (
            <li key={cat.id} className="relative group">
              <Link
                href={`/categoria/${cat.slug}`}
                className="block px-4 py-3 text-sm font-medium text-stone-700 hover:text-amber-700 transition-colors"
              >
                {cat.name}
              </Link>
              {cat.children.length > 0 && (
                <div className="absolute left-0 top-full bg-white border border-stone-200 rounded-lg shadow-lg min-w-48 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-40">
                  <ul className="py-2">
                    {cat.children.map((child) => (
                      <li key={child.id}>
                        <Link
                          href={`/categoria/${child.slug}`}
                          className="block px-4 py-2 text-sm text-stone-600 hover:text-amber-700 hover:bg-stone-50 transition-colors"
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
  )
}
