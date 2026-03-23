import Link from 'next/link'

interface BreadcrumbItem {
  name: string
  href: string
}

interface BreadcrumbProps {
  items: BreadcrumbItem[]
}

export default function Breadcrumb({ items }: BreadcrumbProps) {
  const allItems: BreadcrumbItem[] = [{ name: 'Inicio', href: '/' }, ...items]

  return (
    <nav aria-label="Breadcrumb" className="text-sm text-stone-500">
      <ol className="flex items-center gap-1 flex-wrap">
        {allItems.map((item, index) => {
          const isLast = index === allItems.length - 1
          return (
            <li key={item.href} className="flex items-center gap-1">
              {index > 0 && (
                <span className="text-stone-400" aria-hidden="true">
                  &gt;
                </span>
              )}
              {isLast ? (
                <span className="text-stone-800 font-medium">{item.name}</span>
              ) : (
                <Link
                  href={item.href}
                  className="hover:text-amber-700 transition-colors"
                >
                  {item.name}
                </Link>
              )}
            </li>
          )
        })}
      </ol>
    </nav>
  )
}
