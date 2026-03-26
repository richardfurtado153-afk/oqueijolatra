export default function AdminLoading() {
  return (
    <div className="animate-pulse">
      <div className="h-8 w-48 bg-stone-200 rounded mb-6" />
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="bg-white rounded-xl p-5 shadow-sm border border-stone-200">
            <div className="w-3 h-3 rounded-full bg-stone-200 mb-3" />
            <div className="h-8 bg-stone-200 rounded w-1/2 mb-2" />
            <div className="h-4 bg-stone-200 rounded w-3/4" />
          </div>
        ))}
      </div>
    </div>
  )
}
