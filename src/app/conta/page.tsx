import type { Metadata } from 'next'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { authOptions } from '@/lib/auth'

export const metadata: Metadata = {
  title: 'Minha Conta',
}

export default async function AccountPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect('/conta/login')
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-stone-900 mb-2">
        Ola, {session.user.name}!
      </h1>
      <p className="text-stone-500 mb-8">
        Bem-vindo a sua conta. Gerencie seus pedidos e favoritos.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Link
          href="/conta/pedidos"
          className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Meus Pedidos</h2>
          <p className="text-sm text-stone-500">Acompanhe seus pedidos e historico de compras</p>
        </Link>

        <Link
          href="/conta/favoritos"
          className="block p-6 bg-white rounded-xl border border-stone-200 hover:border-amber-300 hover:shadow-sm transition-all"
        >
          <h2 className="text-lg font-semibold text-stone-900 mb-1">Favoritos</h2>
          <p className="text-sm text-stone-500">Veja os produtos que voce salvou</p>
        </Link>
      </div>
    </div>
  )
}
