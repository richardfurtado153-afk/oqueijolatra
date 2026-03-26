import { prisma } from '@/lib/prisma'
import { createCoupon, toggleCoupon } from '../actions/coupons'

export default async function AdminCoupons() {
  const coupons = await prisma.coupon.findMany({ orderBy: { validUntil: 'desc' } })
  const now = new Date()

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl font-bold text-stone-800 mb-6">Cupons</h1>
      <div className="bg-white rounded-xl border border-stone-200 mb-6 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-stone-50 border-b border-stone-200">
            <tr>
              <th className="text-left px-4 py-3">Código</th>
              <th className="text-left px-4 py-3">Tipo</th>
              <th className="text-left px-4 py-3">Desconto</th>
              <th className="text-left px-4 py-3">Uso</th>
              <th className="text-left px-4 py-3">Validade</th>
              <th className="px-4 py-3"></th>
            </tr>
          </thead>
          <tbody>
            {coupons.map((c) => {
              const expired = new Date(c.validUntil) < now
              return (
                <tr key={c.id} className={`border-b border-stone-100 ${expired ? 'opacity-50' : ''}`}>
                  <td className="px-4 py-3 font-mono font-bold">{c.code}</td>
                  <td className="px-4 py-3">{c.type}</td>
                  <td className="px-4 py-3">{c.type === 'PERCENT' ? `${c.discountPercent}%` : `R$ ${Number(c.discountValue).toFixed(2)}`}</td>
                  <td className="px-4 py-3">{c.usageCount}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                  <td className="px-4 py-3 text-xs">{new Date(c.validUntil).toLocaleDateString('pt-BR')}</td>
                  <td className="px-4 py-3">
                    <form action={toggleCoupon.bind(null, c.id, !c.active)}>
                      <button type="submit" className={`px-2 py-1 rounded-full text-xs font-medium ${c.active ? 'bg-green-100 text-green-700' : 'bg-stone-100 text-stone-500'}`}>
                        {c.active ? 'Ativo' : 'Inativo'}
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {coupons.length === 0 && <div className="text-center py-8 text-stone-400">Nenhum cupom</div>}
      </div>
      <div className="bg-white rounded-xl p-5 border border-stone-200">
        <h2 className="font-semibold mb-4 text-stone-700">Novo Cupom</h2>
        <form action={createCoupon} className="grid grid-cols-2 gap-3">
          <input name="code" placeholder="Código (ex: NATAL20)" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm uppercase" />
          <select name="type" className="border border-stone-300 rounded-lg px-3 py-2 text-sm">
            <option value="PERCENT">Percentual (%)</option>
            <option value="FIXED">Valor fixo (R$)</option>
          </select>
          <input name="discountValue" type="number" step="0.01" placeholder="Valor do desconto" required className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="minOrderValue" type="number" step="0.01" placeholder="Pedido mínimo (R$)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <input name="usageLimit" type="number" placeholder="Limite de usos (vazio = ilimitado)" className="border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          <div />
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Válido a partir de</label>
            <input name="validFrom" type="date" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div>
            <label className="text-xs text-stone-500 mb-1 block">Válido até</label>
            <input name="validUntil" type="date" required className="w-full border border-stone-300 rounded-lg px-3 py-2 text-sm" />
          </div>
          <div className="col-span-2">
            <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">Criar Cupom</button>
          </div>
        </form>
      </div>
    </div>
  )
}
