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

  return (
    <section className="relative w-full h-[400px] md:h-[500px] overflow-hidden">
      {banners.map((banner, index) => (
        <Link
          key={banner.id}
          href={banner.link}
          className={`absolute inset-0 transition-opacity duration-700 ${
            index === current ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
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
        <div className="absolute bottom-4 left-0 right-0 z-20 flex justify-center gap-2">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrent(index)}
              className={`w-3 h-3 rounded-full transition-colors ${
                index === current
                  ? 'bg-white'
                  : 'bg-white/50 hover:bg-white/75'
              }`}
              aria-label={`Ir para banner ${index + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  )
}
