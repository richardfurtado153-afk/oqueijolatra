import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { CartItem } from '@/types'

function matchesItem(
  item: CartItem,
  productId: string,
  variationId: string | null
): boolean {
  return item.productId === productId && item.variationId === variationId
}

interface CartStore {
  items: CartItem[]
  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void
  removeItem: (productId: string, variationId: string | null) => void
  updateQuantity: (productId: string, variationId: string | null, qty: number) => void
  clearCart: () => void
  getItemCount: () => number
  getSubtotal: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      addItem: (item, qty = 1) => {
        set((state) => {
          const existing = state.items.find((i) =>
            matchesItem(i, item.productId, item.variationId)
          )
          if (existing) {
            return {
              items: state.items.map((i) =>
                matchesItem(i, item.productId, item.variationId)
                  ? { ...i, quantity: i.quantity + qty }
                  : i
              ),
            }
          }
          return { items: [...state.items, { ...item, quantity: qty }] }
        })
      },
      removeItem: (productId, variationId) => {
        set((state) => ({
          items: state.items.filter((i) => !matchesItem(i, productId, variationId)),
        }))
      },
      updateQuantity: (productId, variationId, qty) => {
        if (qty <= 0) {
          get().removeItem(productId, variationId)
          return
        }
        set((state) => ({
          items: state.items.map((i) =>
            matchesItem(i, productId, variationId)
              ? { ...i, quantity: qty }
              : i
          ),
        }))
      },
      clearCart: () => set({ items: [] }),
      getItemCount: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
      getSubtotal: () => get().items.reduce((sum, i) => sum + i.price * i.quantity, 0),
    }),
    { name: 'queijolatra-cart' }
  )
)
