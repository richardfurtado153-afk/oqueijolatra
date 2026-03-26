export default function HomeLoading() {
  return (
    <div className="animate-pulse">
      {/* Banner skeleton */}
      <div className="w-full h-64 md:h-96 bg-stone-200" />

      {/* Newsletter bar skeleton */}
      <div className="bg-amber-50 py-4">
        <div className="max-w-7xl mx-auto px-4 flex justify-center">
          <div className="h-10 w-96 bg-stone-200 rounded-lg" />
        </div>
      </div>

      {/* Product showcases skeleton */}
      <div className="max-w-7xl mx-auto px-4 space-y-8 py-8">
        {[1, 2, 3].map((i) => (
          <div key={i}>
            <div className="h-7 w-48 bg-stone-200 rounded mb-4" />
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {[1, 2, 3, 4].map((j) => (
                <div key={j} className="bg-white rounded-xl p-3 shadow-sm border border-stone-200">
                  <div className="aspect-square bg-stone-200 rounded-lg mb-3" />
                  <div className="h-4 bg-stone-200 rounded w-3/4 mb-2" />
                  <div className="h-5 bg-stone-200 rounded w-1/2" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
