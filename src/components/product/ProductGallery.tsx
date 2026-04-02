'use client'

import { useState, useCallback } from 'react'
import Image from 'next/image'

interface GalleryImage {
  id: string
  url: string
  alt: string | null
}

interface ProductGalleryProps {
  images: GalleryImage[]
  productName: string
}

export default function ProductGallery({ images, productName }: ProductGalleryProps) {
  const [selectedIndex, setSelectedIndex] = useState(0)
  const [imgError, setImgError] = useState(false)

  const goTo = useCallback((index: number) => {
    setSelectedIndex(index)
    setImgError(false)
  }, [])

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-stone-100 rounded-xl flex flex-col items-center justify-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" className="w-12 h-12 text-stone-300" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
        </svg>
        <span className="text-stone-400 text-sm">Sem imagem disponivel</span>
      </div>
    )
  }

  const mainImage = images[selectedIndex] || images[0]

  function handleKeyDown(e: React.KeyboardEvent) {
    if (images.length <= 1) return
    if (e.key === 'ArrowLeft') {
      e.preventDefault()
      goTo((selectedIndex - 1 + images.length) % images.length)
    } else if (e.key === 'ArrowRight') {
      e.preventDefault()
      goTo((selectedIndex + 1) % images.length)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <div
        className="relative w-full aspect-square bg-stone-50 rounded-xl overflow-hidden"
        onKeyDown={handleKeyDown}
        tabIndex={0}
        role="img"
        aria-label={`${mainImage.alt || productName} - imagem ${selectedIndex + 1} de ${images.length}`}
      >
        {imgError ? (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-stone-300">
            <svg xmlns="http://www.w3.org/2000/svg" className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <span className="text-sm">Erro ao carregar imagem</span>
          </div>
        ) : (
          <Image
            key={mainImage.id}
            src={mainImage.url}
            alt={mainImage.alt || productName}
            fill
            className="object-contain transition-opacity duration-300"
            sizes="(max-width: 768px) 100vw, 500px"
            priority
            unoptimized={mainImage.url.startsWith('http')}
            onError={() => setImgError(true)}
          />
        )}

        {/* Navigation arrows for multiple images */}
        {images.length > 1 && (
          <>
            <button
              type="button"
              onClick={() => goTo((selectedIndex - 1 + images.length) % images.length)}
              className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors"
              aria-label="Imagem anterior"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <button
              type="button"
              onClick={() => goTo((selectedIndex + 1) % images.length)}
              className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white shadow-md rounded-full w-8 h-8 flex items-center justify-center text-stone-600 hover:text-stone-800 transition-colors"
              aria-label="Proxima imagem"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
            <span className="absolute bottom-2 right-2 bg-black/50 text-white text-xs px-2 py-1 rounded-md">
              {selectedIndex + 1}/{images.length}
            </span>
          </>
        )}
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1" role="tablist" aria-label="Miniaturas do produto">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              role="tab"
              aria-selected={index === selectedIndex}
              aria-label={`Ver imagem ${index + 1}`}
              onClick={() => goTo(index)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all duration-200 ${
                index === selectedIndex
                  ? 'border-amber-600 ring-1 ring-amber-600'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} - imagem ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
                unoptimized={img.url.startsWith('http')}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
