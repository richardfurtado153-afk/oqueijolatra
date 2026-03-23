'use client'

import { useState } from 'react'
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

  if (images.length === 0) {
    return (
      <div className="relative w-full aspect-square bg-stone-100 rounded-xl flex items-center justify-center">
        <span className="text-stone-400 text-sm">Sem imagem</span>
      </div>
    )
  }

  const mainImage = images[selectedIndex] || images[0]

  return (
    <div className="flex flex-col gap-3">
      <div className="relative w-full aspect-square bg-stone-50 rounded-xl overflow-hidden">
        <Image
          src={mainImage.url}
          alt={mainImage.alt || productName}
          fill
          className="object-contain"
          sizes="(max-width: 768px) 100vw, 500px"
          priority
        />
      </div>

      {images.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {images.map((img, index) => (
            <button
              key={img.id}
              type="button"
              onClick={() => setSelectedIndex(index)}
              className={`relative w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-colors ${
                index === selectedIndex
                  ? 'border-amber-600'
                  : 'border-stone-200 hover:border-stone-400'
              }`}
            >
              <Image
                src={img.url}
                alt={img.alt || `${productName} - imagem ${index + 1}`}
                fill
                className="object-cover"
                sizes="64px"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
