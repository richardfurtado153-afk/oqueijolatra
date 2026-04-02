import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'

export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <a href="#main-content" className="sr-only-focusable">
        Pular para o conteudo principal
      </a>
      <Header />
      <main id="main-content" className="flex-1">{children}</main>
      <Footer />
    </>
  )
}
