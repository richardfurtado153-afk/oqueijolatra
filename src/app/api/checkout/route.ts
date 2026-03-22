import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { prisma } from '@/lib/prisma'
import { Decimal } from '@/generated/prisma/client/runtime/library'
import { paymentProvider } from '@/lib/payment'

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
  const session = await getServerSession(authOptions)
  if (!session?.user) {
    return NextResponse.json({ error: 'Nao autenticado' }, { status: 401 })
  }
  const customerId = (session.user as { id: string }).id

  let body: CheckoutBody
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Corpo da requisicao invalido' }, { status: 400 })
  }

  const {
    items,
    customerName,
    email,
    phone,
    cpf,
    shippingCep,
    shippingStreet,
    shippingNumber,
    shippingComplement,
    shippingNeighborhood,
    shippingCity,
    shippingState,
    shippingMethod,
    shippingCost,
    paymentMethod,
    couponCode,
    cardToken,
  } = body

  if (!items || items.length === 0) {
    return NextResponse.json({ error: 'Carrinho vazio' }, { status: 400 })
  }

  if (!customerName || !email || !phone || !cpf) {
    return NextResponse.json({ error: 'Dados do cliente obrigatorios' }, { status: 400 })
  }

  if (!shippingCep || !shippingStreet || !shippingNumber || !shippingNeighborhood || !shippingCity || !shippingState) {
    return NextResponse.json({ error: 'Endereco de entrega obrigatorio' }, { status: 400 })
  }

  if (!shippingMethod || shippingCost == null) {
    return NextResponse.json({ error: 'Metodo e custo de envio obrigatorios' }, { status: 400 })
  }

  if (!paymentMethod || !['PIX', 'CARD'].includes(paymentMethod)) {
    return NextResponse.json({ error: 'Metodo de pagamento invalido' }, { status: 400 })
  }

  try {
    const order = await prisma.$transaction(async (tx) => {
      // 1. Resolve coupon discount
      let discountAmount = new Decimal(0)
      if (couponCode) {
        const coupon = await tx.coupon.findUnique({ where: { code: couponCode } })
        if (!coupon) throw new Error('Cupom invalido')
        if (!coupon.active) throw new Error('Cupom inativo')

        const now = new Date()
        if (now < coupon.validFrom || now > coupon.validUntil) {
          throw new Error('Cupom fora da validade')
        }
        if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
          throw new Error('Cupom esgotado')
        }

        // We'll calculate discount after subtotal is known; store coupon for later
        var resolvedCoupon = coupon
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

          // Decrement variation stock
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

          // Decrement product stock
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
      if (resolvedCoupon!) {
        if (resolvedCoupon.minOrderValue && subtotal.lt(resolvedCoupon.minOrderValue)) {
          throw new Error(`Valor minimo do pedido para este cupom: R$ ${resolvedCoupon.minOrderValue}`)
        }

        if (resolvedCoupon.type === 'PERCENT' && resolvedCoupon.discountPercent) {
          discountAmount = subtotal.mul(resolvedCoupon.discountPercent).div(100)
        } else if (resolvedCoupon.type === 'FIXED' && resolvedCoupon.discountValue) {
          discountAmount = resolvedCoupon.discountValue
        }

        // Cap discount to subtotal
        if (discountAmount.gt(subtotal)) {
          discountAmount = subtotal
        }

        // Increment coupon usage
        await tx.coupon.update({
          where: { id: resolvedCoupon.id },
          data: { usageCount: { increment: 1 } },
        })
      }

      const shippingCostDecimal = new Decimal(shippingCost)
      const total = subtotal.sub(discountAmount).add(shippingCostDecimal)

      // 4. Create order
      const createdOrder = await tx.order.create({
        data: {
          customerId,
          customerName,
          email,
          phone,
          cpf,
          shippingCep,
          shippingStreet,
          shippingNumber,
          shippingComplement: shippingComplement || null,
          shippingNeighborhood,
          shippingCity,
          shippingState,
          shippingMethod,
          shippingCost: shippingCostDecimal,
          subtotal,
          discount: discountAmount,
          total,
          couponCode: couponCode || null,
          paymentMethod,
          items: {
            create: orderItemsData,
          },
        },
        include: { items: true },
      })

      return createdOrder
    })

    // 5. Create payment outside the transaction
    let paymentData: any = {}
    if (paymentMethod === 'PIX') {
      paymentData = await paymentProvider.createPixPayment(order)
    } else if (paymentMethod === 'CARD' && cardToken) {
      paymentData = await paymentProvider.createCardPayment(order, cardToken)

      if (paymentData.status === 'CONFIRMED') {
        await prisma.order.update({
          where: { id: order.id },
          data: {
            paymentStatus: 'CONFIRMED',
            paymentExternalId: paymentData.transactionId,
          },
        })
      }
    }

    return NextResponse.json({ order, payment: paymentData }, { status: 201 })
  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Erro ao criar pedido' }, { status: 400 })
  }
}
