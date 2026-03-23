import { MercadoPagoConfig, Payment } from 'mercadopago'

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADOPAGO_ACCESS_TOKEN ?? '',
})

const paymentClient = new Payment(client)

export interface PaymentProvider {
  createPixPayment(order: any): Promise<{ qrCode: string; copyPaste: string; expiresAt: Date; externalId: string }>
  createCardPayment(order: any, cardToken: string): Promise<{ status: string; transactionId: string }>
  handleWebhook(payload: unknown): Promise<{ orderId: string; status: 'CONFIRMED' | 'FAILED' }>
}

export const paymentProvider: PaymentProvider = {
  async createPixPayment(order) {
    // If no token configured, return stub for development
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-placeholder')) {
      return {
        qrCode: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
        copyPaste: '00020126580014br.gov.bcb.pix0136placeholder@queijolatra.com.br5204000053039865802BR5925O Queijolatra6009Sao Paulo62070503***6304E2CA',
        expiresAt: new Date(Date.now() + 30 * 60 * 1000),
        externalId: `STUB-${Date.now()}`,
      }
    }

    const result = await paymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        description: `Pedido #${order.orderNumber} - O Queijolatra`,
        payment_method_id: 'pix',
        payer: {
          email: order.email,
          first_name: order.customerName.split(' ')[0],
          last_name: order.customerName.split(' ').slice(1).join(' ') || 'Cliente',
          identification: { type: 'CPF', number: order.cpf.replace(/\D/g, '') },
        },
        external_reference: order.id,
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
        date_of_expiration: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
      }
    })

    const qrCode = result.point_of_interaction?.transaction_data?.qr_code_base64 ?? ''
    const copyPaste = result.point_of_interaction?.transaction_data?.qr_code ?? ''

    return {
      qrCode: qrCode ? `data:image/png;base64,${qrCode}` : '',
      copyPaste,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000),
      externalId: String(result.id ?? ''),
    }
  },

  async createCardPayment(order, cardToken) {
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-placeholder')) {
      return { status: 'CONFIRMED', transactionId: `STUB-${Date.now()}` }
    }

    const result = await paymentClient.create({
      body: {
        transaction_amount: Number(order.total),
        token: cardToken,
        description: `Pedido #${order.orderNumber} - O Queijolatra`,
        installments: 1,
        payment_method_id: 'visa',
        payer: { email: order.email },
        external_reference: order.id,
        notification_url: `${process.env.NEXTAUTH_URL}/api/webhooks/payment`,
      }
    })
    return {
      status: result.status === 'approved' ? 'CONFIRMED' : 'FAILED',
      transactionId: String(result.id ?? ''),
    }
  },

  async handleWebhook(payload) {
    const p = payload as any
    if (p?.action !== 'payment.updated' || !p?.data?.id) {
      return { orderId: '', status: 'FAILED' }
    }
    if (!process.env.MERCADOPAGO_ACCESS_TOKEN || process.env.MERCADOPAGO_ACCESS_TOKEN.startsWith('TEST-placeholder')) {
      return { orderId: p?.data?.external_reference ?? '', status: 'CONFIRMED' }
    }
    const result = await paymentClient.get({ id: String(p.data.id) })
    const orderId = result.external_reference ?? ''
    const status = result.status === 'approved' ? 'CONFIRMED' : 'FAILED'
    return { orderId, status }
  },
}
