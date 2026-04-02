export interface CartItem {
  productId: string
  variationId: string | null
  name: string
  variationName: string | null
  image: string
  price: number
  quantity: number
}

export interface ShippingOption {
  method: string
  price: number
  days: number
}

export interface ApiError {
  error: string
  details?: Record<string, string>
}

export interface ProductCardData {
  id: string
  name: string
  slug: string
  price: number
  compareAtPrice: number | null
  image: string
}

export interface PrismaProductWithImages {
  id: string
  name: string
  slug: string
  price: { toNumber?: () => number } | number
  compareAtPrice: { toNumber?: () => number } | number | null
  images: { url: string; isMain: boolean }[]
}

export const ORDER_STATUS_LABELS: Record<string, { label: string; color: string }> = {
  PENDING: { label: 'Pendente', color: 'bg-yellow-100 text-yellow-800' },
  PAID: { label: 'Pago', color: 'bg-green-100 text-green-800' },
  PROCESSING: { label: 'Processando', color: 'bg-blue-100 text-blue-800' },
  SHIPPED: { label: 'Enviado', color: 'bg-purple-100 text-purple-800' },
  DELIVERED: { label: 'Entregue', color: 'bg-green-100 text-green-800' },
  CANCELLED: { label: 'Cancelado', color: 'bg-red-100 text-red-800' },
}
