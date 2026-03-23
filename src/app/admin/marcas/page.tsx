import { prisma } from '@/lib/prisma'
import { createBrand, deleteBrand } from '../actions/brands'

export default async function AdminBrands() {
  const brands = await prisma.brand.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { products: true } } },
  })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Marcas</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3">Nome</th>
              <th className="text-left px-4 py-3">Slug</th>
              <th className="text-right px-4 py-3">Produtos</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {brands.map((b) => (
              <tr key={b.id} className="border-b border-stone-100">
                <td className="px-4 py-3 font-medium">{b.name}</td>
                <td className="px-4 py-3 font-mono text-xs text-stone-500">{b.slug}</td>
                <td className="px-4 py-3 text-right">{b._count.products}</td>
                <td className="px-4 py-3 text-right">
                  <form action={deleteBrand.bind(null, b.id)} className="inline">
                    <button type="submit" className="text-red-500 hover:underline text-xs">Excluir</button>
                  </form>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Nova Marca</h2>
        <form action={createBrand} className="space-y-3">
          <input name="name" placeholder="Nome da marca" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="logoUrl" placeholder="URL do logo (opcional)" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar</button>
        </form>
      </div>
    </div>
  )
}
