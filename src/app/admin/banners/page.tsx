import { prisma } from '@/lib/prisma'
import { createBanner, deleteBanner, toggleBanner } from '../actions/banners'

export default async function AdminBanners() {
  const banners = await prisma.banner.findMany({ orderBy: { position: 'asc' } })

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Banners</h1>
      <div className="space-y-3 mb-6">
        {banners.map((b) => (
          <div key={b.id} className="bg-white rounded-xl p-4 border border-stone-200 flex items-center gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={b.imageUrl} alt={b.title} className="w-24 h-14 object-cover rounded" />
            <div className="flex-1">
              <div className="font-medium">{b.title}</div>
              <div className="text-sm text-stone-500">{b.link}</div>
              <div className="text-xs text-stone-400">Posição: {b.position}</div>
            </div>
            <div className="flex gap-3 items-center">
              <form action={toggleBanner.bind(null, b.id, !b.active)}>
                <button type="submit" className={`px-3 py-1 rounded-full text-xs font-medium ${b.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                  {b.active ? 'Ativo' : 'Inativo'}
                </button>
              </form>
              <form action={deleteBanner.bind(null, b.id)}>
                <button type="submit" className="text-red-500 hover:underline text-sm">Excluir</button>
              </form>
            </div>
          </div>
        ))}
        {banners.length === 0 && <p className="text-stone-400 text-center py-8">Nenhum banner</p>}
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Novo Banner</h2>
        <form action={createBanner} className="space-y-3">
          <input name="title" placeholder="Título" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="imageUrl" placeholder="URL da imagem" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="link" placeholder="Link (ex: /queijos)" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <div className="flex gap-3">
            <input name="position" type="number" placeholder="Posição" defaultValue="0" className="border border-stone-300 rounded-lg px-3 py-2 text-sm w-28" />
            <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="active" defaultChecked /> Ativo</label>
          </div>
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-lg text-sm font-medium">Criar Banner</button>
        </form>
      </div>
    </div>
  )
}
