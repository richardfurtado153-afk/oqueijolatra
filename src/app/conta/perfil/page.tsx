import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { redirect } from 'next/navigation'
import { updateProfile, changePassword } from '../actions'

export default async function ProfilePage() {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) redirect('/conta/login')
  const userId = (session!.user as any).id as string

  const customer = await prisma.customer.findUnique({ where: { id: userId } })
  if (!customer) redirect('/conta/login')

  return (
    <div className="max-w-2xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold text-stone-800 mb-8">Meu Perfil</h1>

      {/* Profile form */}
      <div className="bg-white rounded-xl p-6 border border-stone-200 mb-6">
        <h2 className="font-semibold text-stone-700 mb-4">Dados pessoais</h2>
        <form action={updateProfile} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nome completo</label>
            <input name="name" defaultValue={customer.name} required
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">E-mail</label>
            <input value={customer.email} disabled
              className="w-full border border-stone-200 rounded-lg px-4 py-2 text-sm bg-stone-50 text-stone-400 cursor-not-allowed" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">Telefone</label>
              <input name="phone" defaultValue={customer.phone ?? ''} placeholder="(11) 99999-9999"
                className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
            </div>
            <div>
              <label className="block text-sm font-medium text-stone-700 mb-1">CPF</label>
              <input name="cpf" defaultValue={customer.cpf ?? ''} placeholder="000.000.000-00"
                className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
            </div>
          </div>
          <button type="submit" className="bg-amber-600 hover:bg-amber-700 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Salvar dados
          </button>
        </form>
      </div>

      {/* Password form */}
      <div className="bg-white rounded-xl p-6 border border-stone-200">
        <h2 className="font-semibold text-stone-700 mb-4">Alterar senha</h2>
        <form action={changePassword} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Senha atual</label>
            <input name="currentPassword" type="password" required
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Nova senha</label>
            <input name="newPassword" type="password" required minLength={8}
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium text-stone-700 mb-1">Confirmar nova senha</label>
            <input name="confirmPassword" type="password" required minLength={8}
              className="w-full border border-stone-300 rounded-lg px-4 py-2 text-sm" />
          </div>
          <button type="submit" className="bg-stone-700 hover:bg-stone-800 text-white px-6 py-2 rounded-lg text-sm font-medium">
            Alterar senha
          </button>
        </form>
      </div>
    </div>
  )
}
