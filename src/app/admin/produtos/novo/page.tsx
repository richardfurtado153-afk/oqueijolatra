import { prisma } from '@/lib/prisma'
import { createProduct } from '../../actions/products'

export default async function AdminNewProduct() {
  const [categories, brands] = await Promise.all([
    prisma.category.findMany({ orderBy: { name: 'asc' }, include: { children: true, parent: true } }),
    prisma.brand.findMany({ orderBy: { name: 'asc' } }),
  ])
  const rootCategories = categories.filter((c) => !c.parentId)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Novo Produto</h1>
      <form action={createProduct} className="space-y-4 bg-white rounded-xl p-6 border border-stone-200">
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome *</label>
            <input name="name" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">SKU *</label>
            <input name="sku" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço (R$) *</label>
            <input name="price" type="number" step="0.01" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Preço Antigo (R$)</label>
            <input name="compareAtPrice" type="number" step="0.01" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Estoque</label>
            <input name="stock" type="number" defaultValue="100" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Peso (kg)</label>
            <input name="weight" type="number" step="0.01" defaultValue="0.5" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Categoria *</label>
            <select name="categoryId" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Selecione...</option>
              {rootCategories.map((c) => (
                <optgroup key={c.id} label={c.name}>
                  <option value={c.id}>{c.name}</option>
                  {c.children.map((sub) => <option key={sub.id} value={sub.id}>&nbsp;&nbsp;{sub.name}</option>)}
                </optgroup>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Marca</label>
            <select name="brandId" className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm">
              <option value="">Sem marca</option>
              {brands.map((b) => <option key={b.id} value={b.id}>{b.name}</option>)}
            </select>
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">URL da Imagem Principal</label>
            <input name="imageUrl" type="url" placeholder="https://..." className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <label className="block text-sm font-medium text-stone-700 mb-1">Descrição *</label>
            <textarea name="description" rows={4} required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2 flex gap-6">
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isNew" /> Lançamento</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="isBestseller" /> Mais Vendido</label>
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="featured" /> Destaque</label>
          </div>
        </div>
        <div className="flex gap-3 pt-2">
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Criar Produto</button>
          <a href="/admin/produtos" className="bg-stone-200 hover:bg-stone-300 px-6 py-2 rounded-lg text-sm font-medium">Cancelar</a>
        </div>
      </form>
    </div>
  )
}
