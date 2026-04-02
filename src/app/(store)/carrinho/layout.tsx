import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Carrinho de Compras',
  description:
    'Revise os itens do seu carrinho e finalize sua compra na O Queijolatra.',
  robots: { index: false, follow: true },
  alternates: { canonical: '/carrinho' },
}

export default function CarrinhoLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
