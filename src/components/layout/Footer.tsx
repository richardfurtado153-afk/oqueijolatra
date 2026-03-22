'use client'

import { useState } from 'react'
import Link from 'next/link'
import ContactModal from '@/components/ui/ContactModal'

export default function Footer() {
  const [contactOpen, setContactOpen] = useState(false)

  return (
    <>
      <footer className="bg-stone-800 text-stone-300 mt-auto">
        <div className="max-w-7xl mx-auto px-4 py-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Brand */}
            <div>
              <span className="text-xl font-bold text-white">
                O <span className="text-amber-500">QUEIJOLATRA</span>
              </span>
              <p className="mt-3 text-sm text-stone-400 leading-relaxed">
                Os melhores queijos artesanais do Brasil, selecionados com carinho para a sua mesa.
              </p>
            </div>

            {/* Links */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Navegue</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link href="/categoria/queijos" className="hover:text-white transition-colors">
                    Queijos
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/acompanhamentos" className="hover:text-white transition-colors">
                    Acompanhamentos
                  </Link>
                </li>
                <li>
                  <Link href="/categoria/kits" className="hover:text-white transition-colors">
                    Kits
                  </Link>
                </li>
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-white uppercase tracking-wide mb-3">Contato</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <button
                    onClick={() => setContactOpen(true)}
                    className="hover:text-white transition-colors"
                  >
                    Fale Conosco
                  </button>
                </li>
                <li>
                  <a href="tel:+5511984523161" className="hover:text-white transition-colors">
                    (11) 98452-3161
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/5511984523161"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-white transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-stone-700 mt-8 pt-6 text-center text-sm text-stone-500">
            O Queijolatra &copy; 2026. Todos os direitos reservados.
          </div>
        </div>
      </footer>
      <ContactModal isOpen={contactOpen} onClose={() => setContactOpen(false)} />
    </>
  )
}
