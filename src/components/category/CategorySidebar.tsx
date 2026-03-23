'use client'

import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import PriceFilter from './PriceFilter'

interface FilterItem {
  name: string
  slug: string
  count: number
}

interface CategorySidebarProps {
  categories: FilterItem[]
  brands: FilterItem[]
  currentCategorySlug: string
}

export default function CategorySidebar({
  categories,
  brands,
  currentCategorySlug,
}: CategorySidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const activeBrand = searchParams.get('brand')

  function handleBrandClick(slug: string) {
    const params = new URLSearchParams(searchParams.toString())

    if (activeBrand === slug) {
      params.delete('brand')
    } else {
      params.set('brand', slug)
    }

    params.delete('page')
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
  }

  return (
    <aside className="w-full lg:w-[250px] flex-shrink-0 space-y-6">
      {/* Department filter */}
      {categories.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stone-800">Departamento</h3>
          <ul className="space-y-1">
            {categories.map((cat) => (
              <li key={cat.slug}>
                <a
                  href={`/${cat.slug}`}
                  className={`flex items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${
                    cat.slug === currentCategorySlug
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{cat.name}</span>
                  <span className="text-xs text-stone-400">({cat.count})</span>
                </a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Brand filter */}
      {brands.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-stone-800">Marca</h3>
          <ul className="space-y-1">
            {brands.map((brand) => (
              <li key={brand.slug}>
                <button
                  onClick={() => handleBrandClick(brand.slug)}
                  className={`w-full flex items-center justify-between text-sm px-2 py-1.5 rounded-md transition-colors ${
                    activeBrand === brand.slug
                      ? 'bg-amber-100 text-amber-800 font-medium'
                      : 'text-stone-600 hover:bg-stone-100'
                  }`}
                >
                  <span>{brand.name}</span>
                  <span className="text-xs text-stone-400">({brand.count})</span>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Price filter */}
      <PriceFilter />
    </aside>
  )
}
