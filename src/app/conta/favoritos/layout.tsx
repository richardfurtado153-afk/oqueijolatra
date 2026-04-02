import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Favoritos',
}

export default function FavoritosLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
