export default function CartLoading() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 w-48 bg-stone-200 rounded mb-6" />
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-white rounded-xl p-4 shadow-sm border border-stone-200 flex gap-4">
            <div className="w-20 h-20 bg-stone-200 rounded-lg flex-shrink-0" />
            <div className="flex-1 space-y-2">
              <div className="h-5 bg-stone-200 rounded w-2/3" />
              <div className="h-4 bg-stone-200 rounded w-1/4" />
            </div>
            <div className="h-6 w-20 bg-stone-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
