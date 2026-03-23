import { prisma } from '@/lib/prisma'
import Link from 'next/link'
import { deleteProduct } from '../actions/products'

export default async function AdminProducts({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams
  const products = await prisma.product.findMany({
    where: q ? { name: { contains: q } } : undefined,
    orderBy: { createdAt: 'desc' },
    take: 100,
    include: { images: { where: { isMain: true }, take: 1 }, category: true, brand: true },
  })

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-stone-800">Produtos ({products.length})</h1>
        <Link href="/admin/produtos/novo" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">
          + Novo Produto
        </Link>
      </div>
      <form className="mb-4">
        <input name="q" defaultValue={q} placeholder="Buscar produto..." className="border border-stone-300 rounded-lg px-4 py-2 w-80 text-sm" />
        <button className="ml-2 bg-stone-200 hover:bg-stone-300 px-4 py-2 rounded-lg text-sm">Buscar</button>
      </form>
      <div className="bg-white rounded-xl border border-stone-200 overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              {['Foto', 'Nome', 'SKU', 'Categoria', 'Preço', 'Estoque', 'Ações'].map((h) => (
                <th key={h} className="text-left px-4 py-3 text-stone-600 font-medium">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id} className="border-b border-stone-100 hover:bg-stone-50">
                <td className="px-4 py-3">
                  {p.images[0] ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.images[0].url} alt={p.name} className="w-10 h-10 object-cover rounded" />
                  ) : <div className="w-10 h-10 bg-stone-200 rounded" />}
                </td>
                <td className="px-4 py-3 font-medium">{p.name}</td>
                <td className="px-4 py-3 font-mono text-stone-500">{p.sku}</td>
                <td className="px-4 py-3 text-stone-500">{p.category.name}</td>
                <td className="px-4 py-3">R$ {Number(p.price).toFixed(2).replace('.', ',')}</td>
                <td className="px-4 py-3">
                  <span className={p.stock > 0 ? 'text-green-600' : 'text-red-600'}>{p.stock}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex gap-3">
                    <Link href={`/admin/produtos/${p.id}/editar`} className="text-amber-700 hover:underline">Editar</Link>
                    <form action={deleteProduct.bind(null, p.id)} className="inline">
                      <button type="submit" className="text-red-500 hover:underline">Excluir</button>
                    </form>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {products.length === 0 && <div className="text-center py-12 text-stone-400">Nenhum produto encontrado</div>}
      </div>
    </div>
  )
}
