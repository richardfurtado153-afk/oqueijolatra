import Link from 'next/link'
import TopBar from './TopBar'
import SearchBar from './SearchBar'
import MainMenu from './MainMenu'
import MiniCart from './MiniCart'

export default function Header() {
  return (
    <header>
      <TopBar />
      <div className="bg-white border-b border-stone-200">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between gap-6">
          <Link href="/" className="flex-shrink-0">
            <span className="text-2xl md:text-3xl font-bold tracking-tight text-stone-800">
              O <span className="text-amber-700">QUEIJOLATRA</span>
            </span>
          </Link>
          <div className="hidden md:flex flex-1 justify-center">
            <SearchBar />
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/minha-conta"
              className="hidden sm:flex items-center gap-1 text-stone-600 hover:text-amber-700 transition-colors text-sm"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
