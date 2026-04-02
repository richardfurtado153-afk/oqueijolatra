import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Redefinir Senha',
}

export default function RedefinirSenhaLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
