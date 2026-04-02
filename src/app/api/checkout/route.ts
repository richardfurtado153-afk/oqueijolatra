import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@/generated/prisma/internal/prismaNamespace'
import { paymentProvider } from '@/lib/payment'
import { sendOrderConfirmation } from '@/lib/email'
import { calculateShipping } from '@/lib/shipping'
import { apiSuccess, apiError, requireAuth, parseBody } from '@/lib/api'

interface CheckoutItem {
  productId: string
  variationId?: string
  quantity: number
}

interface CheckoutBody {
  items: CheckoutItem[]
  customerName: string
  email: string
  phone: string
  cpf: string
  shippingCep: string
  shippingStreet: string
  shippingNumber: string
  shippingComplement?: string
  shippingNeighborhood: string
  shippingCity: string
  shippingState: string
  shippingMethod: string
  shippingCost: number
  paymentMethod: 'PIX' | 'CARD'
  couponCode?: string
  cardToken?: string
}

export async function POST(request: NextRequest) {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const parsed = await parseBody<CheckoutBody>(request)
  if (parsed.error) return parsed.error
  const body = parsed.data

  const {
    items, customerName, email, phone, cpf,
    shippingCep, shippingStreet, shippingNumber, shippingComplement,
    shippingNeighborhood, shippingCity, shippingState,
    shippingMethod, shippingCost, paymentMethod, couponCode, cardToken,
  } = body

  if (!items || items.length === 0) {
    return apiError('Carrinho vazio')
  }
  if (!customerName || !email || !phone || !cpf) {
    return apiError('Dados do cliente obrigatorios')
  }
  if (!shippingCep || !shippingStreet || !shippingNumber || !shippingNeighborhood || !shippingCity || !shippingState) {
    return apiError('Endereco de entrega obrigatorio')
  }
  if (!shippingMethod || shippingCost == null) {
    return apiError('Metodo e custo de envio obrigatorios')
  }
  if (!paymentMethod || !['PIX', 'CARD'].includes(paymentMethod)) {
    return apiError('Metodo de pagamento invalido')
  }

  // SECURITY: Validate email format
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return apiError('Email invalido')
  }

  // SECURITY: Validate CPF format (11 digits)
  const cpfClean = cpf.replace(/\D/g, '')
  if (cpfClean.length !== 11) {
    return apiError('CPF invalido')
  }

  // SECURITY: Validate CEP format (8 digits)
  const cepClean = shippingCep.replace(/\D/g, '')
  if (cepClean.length !== 8) {
    return apiError('CEP invalido')
  }

  // SECURITY: Validate quantity bounds
  for (const item of items) {
    if (!Number.isInteger(item.quantity) || item.quantity < 1 || item.quantity > 100) {
      return apiError('Quantidade invalida')
    }
  }

  // SECURITY: Server-side shipping cost verification - do not trust client value
  if (typeof shippingCost !== 'number' || shippingCost < 0) {
    return apiError('Custo de frete invalido')
  }

  const shippingOptions = await calculateShipping(cepClean, 1000)
  const matchedOption = shippingOptions.find(
    (opt) => opt.method === shippingMethod
  )
  if (!matchedOption) {
    return apiError('Metodo de envio invalido para este CEP')
  }
  // Allow a small tolerance for rounding, but reject manipulation
  if (Math.abs(shippingCost - matchedOption.price) > 1) {
    return apiError('Custo de frete divergente. Recalcule o frete.')
  }
  // Use the server-calculated cost, not the client-submitted one
  const verifiedShippingCost = matchedOption.price

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Resolve coupon discount
      let discountAmount = new Decimal(0)
      let resolvedCoupon: Awaited<ReturnType<typeof tx.coupon.findUnique>> = null

      if (couponCode) {
        resolvedCoupon = await tx.coupon.findUnique({ where: { code: couponCode } })
        if (!resolvedCoupon) throw new Error('Cupom invalido')
        if (!resolvedCoupon.active) throw new Error('Cupom inativo')

        const now = new Date()
        if (now < resolvedCoupon.validFrom || now > resolvedCoupon.validUntil) {
          throw new Error('Cupom fora da validade')
        }
        if (resolvedCoupon.usageLimit && resolvedCoupon.usageCount >= resolvedCoupon.usageLimit) {
          throw new Error('Cupom esgotado')
        }
      }

      // 2. Process items: check stock, decrement, build order items
      let subtotal = new Decimal(0)
      const orderItemsData: {
        productId: string
        productName: string
        productSku: string
        variationName: string | null
        quantity: number
        unitPrice: Decimal
        totalPrice: Decimal
      }[] = []

      for (const item of items) {
        const product = await tx.product.findUnique({
          where: { id: item.productId },
          include: { variations: true },
        })

        if (!product) throw new Error(`Produto ${item.productId} nao encontrado`)
        if (product.status !== 'AVAILABLE') throw new Error(`Produto ${product.name} indisponivel`)

        let unitPrice: Decimal
        let variationName: string | null = null

        if (item.variationId) {
          const variation = product.variations.find((v) => v.id === item.variationId)
          if (!variation) throw new Error(`Variacao ${item.variationId} nao encontrada`)

          if (variation.stock < item.quantity) {
            throw new Error(`Estoque insuficiente para ${product.name} - ${variation.name}`)
          }

          const updated = await tx.productVariation.update({
            where: { id: variation.id },
            data: { stock: { decrement: item.quantity } },
          })
          if (updated.stock < 0) {
            throw new Error(`Estoque insuficiente para ${product.name} - ${variation.name}`)
          }

          unitPrice = variation.price
          variationName = variation.name
        } else {
          if (product.stock < item.quantity) {
            throw new Error(`Estoque insuficiente para ${product.name}`)
          }

          const updated = await tx.product.update({
            where: { id: product.id },
            data: { stock: { decrement: item.quantity } },
          })
          if (updated.stock < 0) {
            throw new Error(`Estoque insuficiente para ${product.name}`)
          }

          unitPrice = product.price
        }

        const totalPrice = unitPrice.mul(item.quantity)
        subtotal = subtotal.add(totalPrice)

        orderItemsData.push({
          productId: product.id,
          productName: product.name,
          productSku: item.variationId
            ? product.variations.find((v) => v.id === item.variationId)!.sku
            : product.sku,
          variationName,
          quantity: item.quantity,
          unitPrice,
          totalPrice,
        })
      }

      // 3. Apply coupon discount
      if (resolvedCoupon) {
        if (resolvedCoupon.minOrderValue && subtotal.lt(resolvedCoupon.minOrderValue)) {
          throw new Error(`Valor minimo do pedido para este cupom: R$ ${resolvedCoupon.minOrderValue}`)
        }

        if (resolvedCoupon.type === 'PERCENT' && resolvedCoupon.discountPercent) {
          discountAmount = subtotal.mul(resolvedCoupon.discountPercent).div(100)
        } else if (resolvedCoupon.type === 'FIXED' && resolvedCoupon.discountValue) {
          discountAmount = resolvedCoupon.discountValue
        }

        if (discountAmount.gt(subtotal)) {
          discountAmount = subtotal
        }

        await tx.coupon.update({
          where: { id: resolvedCoupon.id },
          data: { usageCount: { increment: 1 } },
        })
      }

      const shippingCostDecimal = new Decimal(verifiedShippingCost)
      const total = subtotal.sub(discountAmount).add(shippingCostDecimal)

      // 4. Create order
      return tx.order.create({
        data: {
          customerId: auth.customerId,
          customerName, email, phone, cpf,
          shippingCep, shippingStreet, shippingNumber,
          shippingComplement: shippingComplement || null,
          shippingNeighborhood, shippingCity, shippingState,
          shippingMethod,
          shippingCost: shippingCostDecimal,
          subtotal, discount: discountAmount, total,
          couponCode: couponCode || null,
          paymentMethod,
          items: { create: orderItemsData },
        },
        include: { items: true },
      })
    })

    // 5. Create payment outside the transaction
    let paymentData: Record<string, unknown> = {}
    if (paymentMethod === 'PIX') {
      paymentData = await paymentProvider.createPixPayment(order)
    } else if (paymentMethod === 'CARD' && cardToken) {
      paymentData = await paymentProvider.createCardPayment(order, cardToken)

      if (paymentData.status === 'CONFIRMED') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'CONFIRMED',
            paymentExternalId: paymentData.transactionId as string,
          },
        })
      }
    }

    // Send order confirmation email (non-blocking)
    sendOrderConfirmation({
      id: order.id,
      orderNumber: order.orderNumber,
      email: order.email,
      customerName: order.customerName,
      total: Number(order.total),
      items: order.items.map((i) => ({
        productName: i.productName,
        quantity: i.quantity,
        unitPrice: Number(i.unitPrice),
      })),
      shippingMethod: order.shippingMethod,
      shippingCost: Number(order.shippingCost),
      paymentMethod: order.paymentMethod,
    }).catch(err => console.error('Email send failed:', err))

    return apiSuccess({ order, payment: paymentData }, 201)
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : 'Erro ao criar pedido'
    return apiError(message)
  }
}
