'use server'
import { prisma } from '@/lib/prisma'
import { authOptions } from '@/lib/auth'
import { getServerSession } from 'next-auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateProfile(fd: FormData) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Não autenticado')
  const userId = (session!.user as any).id as string

  await prisma.customer.update({
    where: { id: userId },
    data: {
      name: fd.get('name') as string,
      phone: (fd.get('phone') as string) || null,
      cpf: (fd.get('cpf') as string) || null,
    }
  })
  revalidatePath('/conta/perfil')
}

export async function changePassword(fd: FormData) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Não autenticado')
  const userId = (session!.user as any).id as string

  const current = fd.get('currentPassword') as string
  const newPass = fd.get('newPassword') as string
  const confirm = fd.get('confirmPassword') as string

  if (newPass !== confirm) throw new Error('As senhas não coincidem')
  if (newPass.length < 8) throw new Error('Mínimo 8 caracteres')

  const customer = await prisma.customer.findUnique({ where: { id: userId } })
  if (!customer) throw new Error('Usuário não encontrado')

  const valid = await bcrypt.compare(current, customer.passwordHash)
  if (!valid) throw new Error('Senha atual incorreta')

  const hash = await bcrypt.hash(newPass, 10)
  await prisma.customer.update({ where: { id: userId }, data: { passwordHash: hash } })
}

export async function createAddress(fd: FormData) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Não autenticado')
  const userId = (session!.user as any).id as string

  const isDefault = fd.get('isDefault') === 'on'
  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId: userId },
      data: { isDefault: false }
    })
  }

  await prisma.customerAddress.create({
    data: {
      customerId: userId,
      label: (fd.get('label') as string) || 'Casa',
      cep: fd.get('cep') as string,
      street: fd.get('street') as string,
      number: fd.get('number') as string,
      complement: (fd.get('complement') as string) || null,
      neighborhood: fd.get('neighborhood') as string,
      city: fd.get('city') as string,
      state: fd.get('state') as string,
      isDefault,
    }
  })
  revalidatePath('/conta/enderecos')
}

export async function deleteAddress(addressId: string) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Não autenticado')
  const userId = (session!.user as any).id as string
  await prisma.customerAddress.deleteMany({ where: { id: addressId, customerId: userId } })
  revalidatePath('/conta/enderecos')
}

export async function setDefaultAddress(addressId: string) {
  const session = await getServerSession(authOptions)
  if (!(session?.user as any)?.id) throw new Error('Não autenticado')
  const userId = (session!.user as any).id as string
  await prisma.customerAddress.updateMany({ where: { customerId: userId }, data: { isDefault: false } })
  await prisma.customerAddress.update({ where: { id: addressId }, data: { isDefault: true } })
  revalidatePath('/conta/enderecos')
}
