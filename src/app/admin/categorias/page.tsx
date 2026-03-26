import { prisma } from '@/lib/prisma'
import React from 'react'
import { createCategory, deleteCategory } from '../actions/categories'

export default async function AdminCategories() {
  const categories = await prisma.category.findMany({
    orderBy: [{ parentId: 'asc' }, { name: 'asc' }],
    include: { _count: { select: { products: true } } },
  })
  const roots = categories.filter((c) => !c.parentId)
  const children = categories.filter((c) => !!c.parentId)

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Categorias</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-x-auto">
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
            {roots.map((c) => (
              <React.Fragment key={c.id}>
                <tr className="border-b border-stone-100 bg-stone-50">
                  <td className="px-4 py-3 font-medium">{c.name}</td>
                  <td className="px-4 py-3 font-mono text-xs text-stone-500">{c.slug}</td>
                  <td className="px-4 py-3 text-right">{c._count.products}</td>
                  <td className="px-4 py-3 text-right">
                    <form action={deleteCategory.bind(null, c.id)} className="inline">
                      <button type="submit" className="text-red-500 hover:underline text-xs">Excluir</button>
                    </form>
                  </td>
                </tr>
                {children.filter((ch) => ch.parentId === c.id).map((ch) => (
                  <tr key={ch.id} className="border-b border-stone-100">
                    <td className="px-4 py-3 pl-8 text-stone-600">└ {ch.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-stone-500">{ch.slug}</td>
                    <td className="px-4 py-3 text-right">{ch._count.products}</td>
                    <td className="px-4 py-3 text-right">
                      <form action={deleteCategory.bind(null, ch.id)} className="inline">
                        <button type="submit" className="text-red-500 hover:underline text-xs">Excluir</button>
                      </form>
                    </td>
                  </tr>
                ))}
              </React.Fragment>
            ))}
          </tbody>
        </table>
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Nova Categoria</h2>
        <form action={createCategory} className="flex gap-3">
          <input name="name" placeholder="Nome" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm flex-1" />
          <select name="parentId" className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
            <option value="">Categoria raiz</option>
            {roots.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar</button>
        </form>
      </div>
    </div>
  )
}
