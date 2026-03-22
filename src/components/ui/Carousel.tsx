'use client'

import { useRef, ReactNode } from 'react'
import Link from 'next/link'

interface CarouselProps {
  title: string
  link?: { label: string; href: string }
  children: ReactNode
}

export default function Carousel({ title, link, children }: CarouselProps) {
  const scrollRef = useRef<HTMLDivElement>(null)

  function scroll(direction: 'left' | 'right') {
    if (!scrollRef.current) return
    const amount = scrollRef.current.clientWidth * 0.8
    scrollRef.current.scrollBy({
      left: direction === 'left' ? -amount : amount,
      behavior: 'smooth',
    })
  }

  return (
    <section className="py-8">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl md:text-2xl font-bold text-stone-800">{title}</h2>
        {link && (
          <Link
            href={link.href}
            className="text-amber-700 hover:text-amber-800 text-sm font-medium transition-colors"
          >
            {link.label} &rarr;
          </Link>
        )}
      </div>
      <div className="relative group">
        <button
          onClick={() => scroll('left')}
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Anterior"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <div
          ref={scrollRef}
          className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory scrollbar-hide pb-2"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {children}
        </div>
        <button
          onClick={() => scroll('right')}
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 bg-white/90 shadow-md rounded-full w-9 h-9 flex items-center justify-center text-stone-600 hover:text-stone-800 opacity-0 group-hover:opacity-100 transition-opacity"
          aria-label="Proximo"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </section>
  )
}
