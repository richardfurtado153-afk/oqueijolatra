import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest'
import { useToastStore } from '../toast'

describe('Toast Store', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    useToastStore.setState({ toasts: [] })
  })

  afterEach(() => {
    vi.restoreAllTimers()
  })

  describe('addToast', () => {
    it('adds a toast with default type "success"', () => {
      useToastStore.getState().addToast('Item added!')
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Item added!')
      expect(toasts[0].type).toBe('success')
      expect(toasts[0].id).toBeTruthy()
    })

    it('adds a toast with custom type', () => {
      useToastStore.getState().addToast('Something went wrong', 'error')
      const toasts = useToastStore.getState().toasts
      expect(toasts[0].type).toBe('error')
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

    it('does nothing when removing non-existent id', () => {
      useToastStore.getState().addToast('Keep me')
      useToastStore.getState().removeToast('non-existent')
      expect(useToastStore.getState().toasts).toHaveLength(1)
    })
  })

  describe('auto-dismissal', () => {
    it('removes toast automatically after 4000ms', () => {
      useToastStore.getState().addToast('Auto dismiss')
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(3999)
      expect(useToastStore.getState().toasts).toHaveLength(1)

      vi.advanceTimersByTime(1)
      expect(useToastStore.getState().toasts).toHaveLength(0)
    })

    it('only removes the specific toast after timeout', () => {
      useToastStore.getState().addToast('First')
      vi.advanceTimersByTime(2000)
      useToastStore.getState().addToast('Second')

      vi.advanceTimersByTime(2000)
      // First toast should be gone (4000ms elapsed), second still present (2000ms elapsed)
      const toasts = useToastStore.getState().toasts
      expect(toasts).toHaveLength(1)
      expect(toasts[0].message).toBe('Second')
    })
  })
})
