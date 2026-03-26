export default function CategoryLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      {/* Breadcrumb skeleton */}
      <div className="h-4 w-64 bg-stone-200 rounded mb-6" />

      <div className="flex gap-8">
        {/* Sidebar skeleton */}
        <div className="hidden lg:block w-64 flex-shrink-0 space-y-4">
          <div className="h-6 w-32 bg-stone-200 rounded" />
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="h-4 w-full bg-stone-200 rounded" />
          ))}
          <div className="h-6 w-32 bg-stone-200 rounded mt-6" />
          <div className="h-10 w-full bg-stone-200 rounded" />
        </div>

        {/* Products grid skeleton */}
        <div className="flex-1">
          <div className="h-8 w-48 bg-stone-200 rounded mb-6" />
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 shadow-sm border border-stone-200">
                <div className="aspect-square bg-stone-200 rounded-lg mb-3" />
                <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                <div className="h-5 bg-stone-200 rounded w-1/2" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
