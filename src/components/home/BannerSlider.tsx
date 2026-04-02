'use client'

import { useState, useEffect, useCallback } from 'react'
import Image from 'next/image'
import Link from 'next/link'

interface Banner {
  id: string
  title: string
  imageUrl: string
  link: string
}

interface BannerSliderProps {
  banners: Banner[]
}

export default function BannerSlider({ banners }: BannerSliderProps) {
  const [current, setCurrent] = useState(0)

  const next = useCallback(() => {
    setCurrent((prev) => (prev + 1) % banners.length)
  }, [banners.length])

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(next, 5000)
    return () => clearInterval(timer)
  }, [next, banners.length])

  if (banners.length === 0) return null

  function prev() {
    setCurrent((p) => (p - 1 + banners.length) % banners.length)
  }

  return (
    <section
      className="relative w-full h-[300px] sm:h-[400px] md:h-[500px] overflow-hidden"
      aria-roledescription="carrossel"
      aria-label="Banners promocionais"
    >
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.link}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          aria-hidden={index !== current}
          tabIndex={index === current ? 0 : -1}
        >
          <Image
            src={banner.imageUrl}
            alt={banner.title}
            fill
            className="object-cover"
            priority={index === 0}
            sizes="100vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
          <div className="absolute bottom-12 left-0 right-0 text-center px-4">
            <h2 className="text-white text-2xl md:text-4xl font-bold drop-shadow-lg">
              {banner.title}
            </h2>
          </div>
        </Link>
      ))}

      {banners.length > 1 && (
        <>
          {/* Previous / Next buttons */}
          <button
            onClick={prev}
            className="absolute left-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Banner anterior"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={next}
            className="absolute right-3 top-1/2 -translate-y-1/2 z-20 bg-black/30 hover:bg-black/50 backdrop-blur-sm text-white w-10 h-10 rounded-full flex items-center justify-center transition-colors"
            aria-label="Proximo banner"
          >
            <svg xmlns="http://www.w3.org/2000/svg" className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* Dots */}
          <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2" role="tablist" aria-label="Selecionar banner">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrent(index)}
                role="tab"
                aria-selected={index === current}
                className={`w-3 h-3 rounded-full transition-all duration-300 ${
                  index === current
                    ? 'bg-white w-6'
                    : 'bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Banner ${index + 1} de ${banners.length}`}
              />
            ))}
          </div>
        </>
      )}
    </section>
  )
}
