export interface PaymentProvider {
  createPixPayment(order: any): Promise<{ qrCode: string; copyPaste: string; expiresAt: Date }>
  createCardPayment(order: any, cardToken: string): Promise<{ status: string; transactionId: string }>
  handleWebhook(payload: unknown): Promise<{ orderId: string; status: 'CONFIRMED' | 'FAILED' }>
}

// Stub — replace when gateway docs are provided
export const paymentProvider: PaymentProvider = {
  async createPixPayment(order) {
    return {
      qrCode: 'data:image/png;base64,PLACEHOLDER_QR',
      copyPaste: '00020126580014br.gov.bcb.pix0136placeholder@queijolatra.com.br',
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
    }
  },
  async createCardPayment(order, cardToken) {
    return { status: 'CONFIRMED', transactionId: `STUB-${order.id}` }
  },
  async handleWebhook(payload) {
    return { orderId: '', status: 'CONFIRMED' }
  },
}
