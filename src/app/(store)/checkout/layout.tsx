import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Checkout',
  description:
    'Finalize sua compra na O Queijolatra. Pagamento seguro via PIX ou cartao.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/checkout' },
}

export default function CheckoutLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
