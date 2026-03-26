import { describe, it, expect, beforeEach } from 'vitest'
import { useCartStore } from '../cart'

const sampleItem = {
  productId: 'prod-1',
  variationId: null,
  name: 'Queijo Minas',
  variationName: null,
  image: '/queijo.jpg',
  price: 29.9,
}

const sampleItem2 = {
  productId: 'prod-2',
  variationId: 'var-1',
  name: 'Queijo Canastra',
  variationName: '500g',
  image: '/canastra.jpg',
  price: 59.9,
}

describe('Cart Store', () => {
  beforeEach(() => {
    useCartStore.setState({ items: [] })
  })

  describe('addItem', () => {
    it('adds a new item to the cart', () => {
      useCartStore.getState().addItem(sampleItem)
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('prod-1')
      expect(items[0].quantity).toBe(1)
    })

    it('adds item with custom quantity', () => {
      useCartStore.getState().addItem(sampleItem, 3)
      const items = useCartStore.getState().items
      expect(items[0].quantity).toBe(3)
    })

    it('increases quantity when adding duplicate item', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem(sampleItem, 2)
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].quantity).toBe(3)
    })

    it('treats different variationIds as separate items', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem(sampleItem2)
      expect(useCartStore.getState().items).toHaveLength(2)
    })
  })

  describe('removeItem', () => {
    it('removes an item from the cart', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem(sampleItem2)
      useCartStore.getState().removeItem('prod-1', null)
      const items = useCartStore.getState().items
      expect(items).toHaveLength(1)
      expect(items[0].productId).toBe('prod-2')
    })

    it('does nothing when removing non-existent item', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().removeItem('non-existent', null)
      expect(useCartStore.getState().items).toHaveLength(1)
    })
  })

  describe('updateQuantity', () => {
    it('updates quantity of an existing item', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().updateQuantity('prod-1', null, 5)
      expect(useCartStore.getState().items[0].quantity).toBe(5)
    })

    it('removes item when quantity is set to 0', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().updateQuantity('prod-1', null, 0)
      expect(useCartStore.getState().items).toHaveLength(0)
    })

    it('removes item when quantity is negative', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().updateQuantity('prod-1', null, -1)
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('clearCart', () => {
    it('removes all items from the cart', () => {
      useCartStore.getState().addItem(sampleItem)
      useCartStore.getState().addItem(sampleItem2)
      useCartStore.getState().clearCart()
      expect(useCartStore.getState().items).toHaveLength(0)
    })
  })

  describe('getItemCount', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getItemCount()).toBe(0)
    })

    it('returns total quantity of all items', () => {
      useCartStore.getState().addItem(sampleItem, 2)
      useCartStore.getState().addItem(sampleItem2, 3)
      expect(useCartStore.getState().getItemCount()).toBe(5)
    })
  })

  describe('getSubtotal', () => {
    it('returns 0 for empty cart', () => {
      expect(useCartStore.getState().getSubtotal()).toBe(0)
    })

    it('calculates subtotal correctly', () => {
      useCartStore.getState().addItem(sampleItem, 2) // 29.9 * 2 = 59.8
      useCartStore.getState().addItem(sampleItem2, 1) // 59.9 * 1 = 59.9
      const subtotal = useCartStore.getState().getSubtotal()
      expect(subtotal).toBeCloseTo(119.7, 2)
    })
  })
})
