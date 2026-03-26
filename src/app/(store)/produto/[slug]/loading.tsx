export default function ProductLoading() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-6 animate-pulse">
      {/* Breadcrumb */}
      <div className="h-4 w-72 bg-stone-200 rounded mb-6" />

      <div className="mt-6 flex flex-col lg:flex-row gap-8">
        {/* Gallery */}
        <div className="w-full lg:w-1/2 lg:max-w-[500px]">
          <div className="aspect-square bg-stone-200 rounded-xl" />
          <div className="flex gap-2 mt-3">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-16 h-16 bg-stone-200 rounded-lg" />
            ))}
          </div>
        </div>

        {/* Info */}
        <div className="w-full lg:flex-1 space-y-4">
          <div className="h-8 bg-stone-200 rounded w-3/4" />
          <div className="h-4 bg-stone-200 rounded w-1/3" />
          <div className="h-10 bg-stone-200 rounded w-1/2" />
          <div className="space-y-2">
            <div className="h-4 bg-stone-200 rounded w-2/3" />
            <div className="h-4 bg-stone-200 rounded w-1/2" />
          </div>
          <div className="flex gap-4 mt-4">
            <div className="h-12 w-32 bg-stone-200 rounded-lg" />
            <div className="h-12 flex-1 bg-stone-200 rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  )
}
