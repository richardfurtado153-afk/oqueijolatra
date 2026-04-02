import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { paymentProvider } from '@/lib/payment'
import { apiSuccess, apiError } from '@/lib/api'

// SECURITY: Verify webhook signature from MercadoPago
function verifyWebhookSignature(request: NextRequest, rawBody: string): boolean {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET
  // In dev/stub mode, skip verification
  if (!secret) return true

  const xSignature = request.headers.get('x-signature')
  const xRequestId = request.headers.get('x-request-id')
  if (!xSignature || !xRequestId) return false

  // MercadoPago sends: ts=<timestamp>,v1=<hash>
  const parts = Object.fromEntries(
    xSignature.split(',').map((part) => {
      const [key, ...rest] = part.trim().split('=')
      return [key, rest.join('=')]
    })
  )

  if (!parts.ts || !parts.v1) return false

  // Extract data.id from query params (MercadoPago sends it as query param)
  const dataId = request.nextUrl.searchParams.get('data.id') ?? ''

  const manifest = `id:${dataId};request-id:${xRequestId};ts:${parts.ts};`
  const hmac = crypto.createHmac('sha256', secret).update(manifest).digest('hex')

  return crypto.timingSafeEqual(Buffer.from(hmac), Buffer.from(parts.v1))
}

export async function POST(request: NextRequest) {
  let rawBody: string
  try {
    rawBody = await request.text()
  } catch {
    return apiError('Payload invalido')
  }

  // SECURITY: Verify webhook signature before processing
  if (!verifyWebhookSignature(request, rawBody)) {
    return apiError('Assinatura do webhook invalida', 401)
  }

  let payload: unknown
  try {
    payload = JSON.parse(rawBody)
  } catch {
    return apiError('JSON invalido')
  }

  try {
    const { orderId, status } = await paymentProvider.handleWebhook(payload)

    if (!orderId) {
      return apiError('orderId nao identificado')
    }

    const order = await prisma.order.findUnique({ where: { id: orderId } })
    if (!order) {
      return apiError('Pedido nao encontrado', 404)
    }

    // SECURITY: Prevent re-processing already confirmed orders
    if (order.paymentStatus === 'CONFIRMED' || order.paymentStatus === 'REFUNDED') {
      return apiSuccess({ received: true })
    }

    const paymentStatus = status === 'CONFIRMED' ? 'CONFIRMED' : 'FAILED'
    const orderStatus = status === 'CONFIRMED' ? 'PAID' : 'CANCELLED'

    await prisma.order.update({
      where: { id: orderId },
      data: { paymentStatus, status: orderStatus },
    })

    return apiSuccess({ received: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao processar webhook'
    return apiError(message, 500)
  }
}
