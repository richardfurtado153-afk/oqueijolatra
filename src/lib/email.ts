import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)
const FROM = `O Queijolatra <${process.env.STORE_EMAIL ?? 'contato@queijolatra.com.br'}>`

function formatBRL(val: number) {
  return `R$ ${val.toFixed(2).replace('.', ',')}`
}

export async function sendOrderConfirmation(order: {
  id: string
  orderNumber: number
  email: string
  customerName: string
  total: number
  items: Array<{ productName: string; quantity: number; unitPrice: number }>
  shippingMethod: string
  shippingCost: number
  paymentMethod: string
}) {
  // Dev stub: if API key is placeholder, just log
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    console.log(`[EMAIL STUB] Order confirmation to ${order.email} for order #${order.orderNumber}`)
    return
  }

  const itemsHtml = order.items
    .map(
      (i) =>
        `<tr>
          <td style="padding:8px;border-bottom:1px solid #e7e5e4">${i.productName}</td>
          <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:center">${i.quantity}</td>
          <td style="padding:8px;border-bottom:1px solid #e7e5e4;text-align:right">${formatBRL(i.unitPrice)}</td>
        </tr>`
    )
    .join('')

  const html = `
    <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#292524">
      <div style="background:#b45309;padding:24px;text-align:center">
        <h1 style="color:#fff;margin:0;font-size:24px">O Queijolatra</h1>
      </div>
      <div style="padding:32px 24px">
        <h2 style="color:#292524">Pedido confirmado! 🧀</h2>
        <p>Olá, <strong>${order.customerName}</strong>! Recebemos seu pedido <strong>#${order.orderNumber}</strong>.</p>
        <table style="width:100%;border-collapse:collapse;margin:24px 0">
          <thead>
            <tr style="background:#f5f5f4">
              <th style="padding:8px;text-align:left">Produto</th>
              <th style="padding:8px;text-align:center">Qtd</th>
              <th style="padding:8px;text-align:right">Valor</th>
            </tr>
          </thead>
          <tbody>${itemsHtml}</tbody>
        </table>
        <table style="width:100%;max-width:300px;margin-left:auto">
          <tr><td>Frete (${order.shippingMethod})</td><td style="text-align:right">${formatBRL(order.shippingCost)}</td></tr>
          <tr><td><strong>Total</strong></td><td style="text-align:right"><strong>${formatBRL(order.total)}</strong></td></tr>
        </table>
        <p style="margin-top:32px;color:#78716c">Forma de pagamento: ${order.paymentMethod === 'PIX' ? 'PIX' : 'Cartão'}</p>
        <p style="color:#78716c">Você receberá um novo e-mail quando seu pedido for enviado.</p>
      </div>
      <div style="background:#f5f5f4;padding:16px;text-align:center;color:#78716c;font-size:12px">
        O Queijolatra — contato@queijolatra.com.br
      </div>
    </div>`

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Pedido #${order.orderNumber} confirmado — O Queijolatra`,
    html,
  })
}

export async function sendShippingNotification(order: {
  orderNumber: number
  email: string
  customerName: string
  trackingCode: string
}) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    console.log(`[EMAIL STUB] Shipping notification to ${order.email}, tracking: ${order.trackingCode}`)
    return
  }

  await resend.emails.send({
    from: FROM,
    to: order.email,
    subject: `Pedido #${order.orderNumber} enviado! — O Queijolatra`,
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#292524">
        <div style="background:#b45309;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0">O Queijolatra</h1>
        </div>
        <div style="padding:32px 24px">
          <h2>Seu pedido foi enviado! 📦</h2>
          <p>Olá, <strong>${order.customerName}</strong>!</p>
          <p>Seu pedido <strong>#${order.orderNumber}</strong> foi enviado via SEDEX/PAC.</p>
          <div style="background:#f5f5f4;padding:16px;border-radius:8px;margin:24px 0;text-align:center">
            <p style="margin:0;color:#78716c;font-size:14px">Código de rastreamento</p>
            <p style="margin:8px 0 0;font-size:20px;font-weight:bold;font-family:monospace">${order.trackingCode}</p>
          </div>
          <p>Rastreie em <a href="https://www.correios.com.br/rastreamento" style="color:#b45309">correios.com.br</a></p>
        </div>
      </div>`,
  })
}

export async function sendPasswordResetEmail(to: string, resetUrl: string) {
  if (!process.env.RESEND_API_KEY || process.env.RESEND_API_KEY.startsWith('re_placeholder')) {
    console.log(`[EMAIL STUB] Password reset to ${to}: ${resetUrl}`)
    return
  }

  await resend.emails.send({
    from: FROM,
    to,
    subject: 'Redefinição de senha — O Queijolatra',
    html: `
      <div style="font-family:sans-serif;max-width:600px;margin:0 auto;color:#292524">
        <div style="background:#b45309;padding:24px;text-align:center">
          <h1 style="color:#fff;margin:0">O Queijolatra</h1>
        </div>
        <div style="padding:32px 24px">
          <h2>Redefinição de senha</h2>
          <p>Recebemos uma solicitação para redefinir sua senha.</p>
          <p>Clique no botão abaixo para criar uma nova senha. O link expira em 1 hora.</p>
          <div style="text-align:center;margin:32px 0">
            <a href="${resetUrl}" style="background:#b45309;color:#fff;padding:14px 32px;border-radius:8px;text-decoration:none;font-weight:bold">
              Redefinir Senha
            </a>
          </div>
          <p style="color:#78716c;font-size:14px">Se você não solicitou isso, ignore este e-mail.</p>
        </div>
      </div>`,
  })
}
