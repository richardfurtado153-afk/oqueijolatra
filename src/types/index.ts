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
