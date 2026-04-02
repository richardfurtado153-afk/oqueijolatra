'use server'
import { prisma } from '@/lib/prisma'
import { getAuthenticatedUser, MIN_PASSWORD_LENGTH } from '@/lib/auth'
import { revalidatePath } from 'next/cache'
import bcrypt from 'bcryptjs'

export async function updateProfile(fd: FormData) {
  const user = await getAuthenticatedUser()

  await prisma.customer.update({
    where: { id: user.id },
    data: {
      name: fd.get('name') as string,
      phone: (fd.get('phone') as string) || null,
      cpf: (fd.get('cpf') as string) || null,
    }
  })
  revalidatePath('/conta/perfil')
}

export async function changePassword(fd: FormData) {
  const user = await getAuthenticatedUser()

  const current = fd.get('currentPassword') as string
  const newPass = fd.get('newPassword') as string
  const confirm = fd.get('confirmPassword') as string

  if (newPass !== confirm) throw new Error('As senhas nao coincidem')
  if (newPass.length < MIN_PASSWORD_LENGTH) throw new Error(`Minimo ${MIN_PASSWORD_LENGTH} caracteres`)

  const customer = await prisma.customer.findUnique({ where: { id: user.id } })
  if (!customer) throw new Error('Usuario nao encontrado')

  const valid = await bcrypt.compare(current, customer.passwordHash)
  if (!valid) throw new Error('Senha atual incorreta')

  const hash = await bcrypt.hash(newPass, 10)
  await prisma.customer.update({ where: { id: user.id }, data: { passwordHash: hash } })
}

export async function createAddress(fd: FormData) {
  const user = await getAuthenticatedUser()

  const isDefault = fd.get('isDefault') === 'on'
  if (isDefault) {
    await prisma.customerAddress.updateMany({
      where: { customerId: user.id },
      data: { isDefault: false }
    })
  }

  await prisma.customerAddress.create({
    data: {
      customerId: user.id,
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
  const user = await getAuthenticatedUser()
  await prisma.customerAddress.deleteMany({ where: { id: addressId, customerId: user.id } })
  revalidatePath('/conta/enderecos')
}

export async function setDefaultAddress(addressId: string) {
  const user = await getAuthenticatedUser()
  // SECURITY: Verify the address belongs to the current user before updating
  const address = await prisma.customerAddress.findFirst({
    where: { id: addressId, customerId: user.id },
  })
  if (!address) throw new Error('Endereco nao encontrado')

  await prisma.customerAddress.updateMany({ where: { customerId: user.id }, data: { isDefault: false } })
  await prisma.customerAddress.update({ where: { id: addressId }, data: { isDefault: true } })
  revalidatePath('/conta/enderecos')
}
