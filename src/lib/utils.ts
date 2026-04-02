import type { PrismaProductWithImages, ProductCardData } from '@/types'

export function formatPrice(price: number | string): string {
  const num = typeof price === 'string' ? parseFloat(price) : price
  return num.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
}

export function calcDiscountPercent(original: number, current: number): number {
  if (original <= 0) return 0
  return Math.round(((original - current) / original) * 100)
}

export function generateCouponCode(prefix: string = 'NEWS'): string {
  // SECURITY: Use crypto for unpredictable coupon codes
  const crypto = require('crypto') as typeof import('crypto')
  const bytes = crypto.randomBytes(4)
  const code = bytes.toString('hex').toUpperCase().slice(0, 6)
  return `${prefix}-${code}`
}

export function toCardData(product: PrismaProductWithImages): ProductCardData {
  const price =
    typeof product.price === 'number' ? product.price : Number(product.price)
  const compareAtPrice = product.compareAtPrice
    ? typeof product.compareAtPrice === 'number'
      ? product.compareAtPrice
      : Number(product.compareAtPrice)
    : null
  const mainImage = product.images.find((i) => i.isMain) || product.images[0]
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    price,
    compareAtPrice,
    image: mainImage?.url || '/placeholder.jpg',
  }
}

export function formatCep(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 8)
  if (digits.length > 5) {
    return `${digits.slice(0, 5)}-${digits.slice(5)}`
  }
  return digits
}

export function formatPhone(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 2) return digits
  if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`
}

export function formatCpf(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11)
  if (digits.length <= 3) return digits
  if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`
  if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`
  return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`
}
