import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart'

const makeItem = (overrides: Partial<{
  productId: string
  variationId: string | null
  name: string
  variationName: string | null
  image: string
  price: number
}> = {}) => ({
  productId: overrides.productId ?? 'p1',
  variationId: overrides.variationId ?? null,
  name: overrides.name ?? 'Queijo Minas',
  variationName: overrides.variationName ?? null,
  image: overrides.image ?? '/img.jpg',
  price: overrides.price ?? 29.9,
})

describe('cart store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      useCartStore.getState().addItem(makeItem())
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('p1')
      expect(items[0].quantity).toBe(1)
    })

    it('adds item with custom quantity', () => {
      useCartStore.getState().addItem(makeItem(), 3)
      expect(useCartStore.getState().items[0].quantity).toBe(3)
    })

    it('increases quantity for duplicate item', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().addItem(makeItem())
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(2)
    })

    it('treats different variations as separate items', () => {
      useCartStore.getState().addItem(makeItem({ variationId: 'v1', variationName: '500g' }))
      useCartStore.getState().addItem(makeItem({ variationId: 'v2', variationName: '1kg' }))
      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().removeItem('p1', null)
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('only removes the matching product+variation', () => {
      useCartStore.getState().addItem(makeItem({ variationId: 'v1' }))
      useCartStore.getState().addItem(makeItem({ variationId: 'v2' }))
      useCartStore.getState().removeItem('p1', 'v1')
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].variationId).toBe('v2')
    })
  })

  describe('updateQuantity', () => {
    it('updates the quantity of an item', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQuantity('p1', null, 5)
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity is set to 0', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQuantity('p1', null, 0)
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      useCartStore.getState().addItem(makeItem())
      useCartStore.getState().updateQuantity('p1', null, -1)
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('removes all items', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'p1' }))
      useCartStore.getState().addItem(makeItem({ productId: 'p2' }))
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0)
    })

    it('sums all item quantities', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'p1' }), 2)
      useCartStore.getState().addItem(makeItem({ productId: 'p2' }), 3)
      expect(useCartStore.getState().getItemCount()).toBe(5)
    })
  })

  describe('getSubtotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0)
    })

    it('calculates subtotal correctly', () => {
      useCartStore.getState().addItem(makeItem({ productId: 'p1', price: 10 }), 2)
      useCartStore.getState().addItem(makeItem({ productId: 'p2', price: 25 }), 1)
      expect(useCartStore.getState().getSubtotal()).toBe(45)
    })
  })
})
