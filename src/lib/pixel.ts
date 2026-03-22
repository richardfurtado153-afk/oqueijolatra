export const FB_PIXEL_ID = '409203060039219'

export function trackEvent(event: string, data?: Record<string, any>) {
  if (typeof window !== 'undefined' && (window as any).fbq) {
    (window as any).fbq('track', event, data)
  }
}
