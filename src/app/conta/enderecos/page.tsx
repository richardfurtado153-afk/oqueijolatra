import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { createAddress, deleteAddress, setDefaultAddress } from '../actions'
import AddressForm from './AddressForm'

export const metadata: Metadata = {
  title: 'Meus Enderecos',
}

export default async function AddressesPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect('/conta/login')

  const addresses = await prisma.customerAddress.findMany({
    where: { customerId: session.user.id },
    orderBy: [{ isDefault: 'desc' }],
  })

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Meus Endereços</h1>

      {addresses.length > 0 && (
        <div className="space-y-3 mb-8">
          {addresses.map((addr) => (
            <div key={addr.id} className={`bg-white rounded-xl p-5 border-2 ${addr.isDefault ? 'border-amber-500' : 'border-stone-200'}`}>
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium">{addr.label}</span>
                    {addr.isDefault && <span className="bg-amber-100 text-amber-700 text-xs px-2 py-0.5 rounded-full">Principal</span>}
                  </div>
                  <p className="text-sm text-stone-600">{addr.street}, {addr.number}{addr.complement ? `, ${addr.complement}` : ''}</p>
                  <p className="text-sm text-stone-500">{addr.neighborhood} — {addr.city}/{addr.state}</p>
                  <p className="text-sm text-stone-400">CEP: {addr.cep}</p>
                </div>
                <div className="flex gap-3">
                  {!addr.isDefault && (
                    <form action={setDefaultAddress.bind(null, addr.id)}>
                      <button type="submit" className="text-amber-700 hover:underline text-sm">Tornar principal</button>
                    </form>
                  )}
                  <form action={deleteAddress.bind(null, addr.id)}>
                    <button type="submit" className="text-red-500 hover:underline text-sm">Excluir</button>
                  </form>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="font-semibold text-stone-700 mb-4">Novo Endereço</h2>
        <AddressForm createAddress={createAddress} />
      </div>
    </div>
  )
}
