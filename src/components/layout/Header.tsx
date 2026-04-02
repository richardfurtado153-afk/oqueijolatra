import Link from 'next/link'
import Image from 'next/image'
import TopBar from './TopBar'
import SearchBar from './SearchBar'
import MainMenu from './MainMenu'
import MiniCart from './MiniCart'

export default function Header() {
  return (
    <header role="banner">
      <TopBar />
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4 sm:gap-6">
          <Link href="/" className="flex-shrink-0" aria-label="O Queijolatra - Pagina inicial">
            <Image
              src="/logo.png"
              alt="O Queijolatra"
              width={180}
              height={60}
              className="h-10 sm:h-12 w-auto object-contain"
              priority
            />
          </Link>
          <div className="hidden md:flex flex-1 justify-center">
            <SearchBar />
          </div>
          <div className="flex items-center gap-3 sm:gap-4">
            <Link
              href="/conta"
              className="hidden sm:flex items-center gap-1 text-stone-600 hover:text-amber-700 transition-colors text-sm"
              aria-label="Minha conta"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
              </svg>
              Minha Conta
            </Link>
            <MiniCart />
          </div>
        </div>
        <div className="md:hidden px-4 pb-3">
          <SearchBar />
        </div>
      </div>
      <MainMenu />
    </header>
  )
}
