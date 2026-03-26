import { describe, it, expect, beforeEach, vi } from 'vitest'
import { useToastStore } from '../toast'

describe('toast store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  describe('addToast', () => {
    it('adds a toast with default type "success"', () => {
      useToastStore.getState().addToast('Item adicionado!')
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Item adicionado!')
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].id).toBeTruthy()
    })

    it('adds a toast with custom type', () => {
      useToastStore.getState().addToast('Erro!', 'error')
      expect(useToastStore.getState().toasts[0].type).toBe('error')
    })

    it('can add multiple toasts', () => {
      useToastStore.getState().addToast('First')
      useToastStore.getState().addToast('Second')
      expect(useToastStore.getState().toasts).toHaveLength(2)
    })
  })

  describe('removeToast', () => {
    it('removes a toast by id', () => {
      useToastStore.getState().addToast('To remove')
      const id = useToastStore.getState().toasts[0].id
      useToastStore.getState().removeToast(id)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('does not affect other toasts', () => {
      useToastStore.getState().addToast('Keep')
      useToastStore.getState().addToast('Remove')
      const toasts = useToastStore.getState().toasts
      useToastStore.getState().removeToast(toasts[1].id)
      expect(useToastStore.getState().toasts).toHaveLength(1)
      expect(useToastStore.getState().toasts[0].message).toBe('Keep')
    })
  })

  describe('auto-dismissal', () => {
    it('removes the toast after 4000ms', () => {
      useToastStore.getState().addToast('Will vanish')
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(3999)
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('only removes the specific toast that timed out', () => {
      useToastStore.getState().addToast('First')
      vi.advanceTimersByTime(2000)
      useToastStore.getState().addToast('Second')

      vi.advanceTimersByTime(2000)
      // First should be gone (4000ms elapsed), second still present (2000ms elapsed)
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Second')
    })
  })
})
