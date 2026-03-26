import ProductCard, { type ProductCardData } from './ProductCard'

interface ProductGridProps {
  products: ProductCardData[]
}

export default function ProductGrid({ products }: ProductGridProps) {
  if (products.length === 0) {
    return (
      <div className="flex items-center justify-center py-16 text-stone-500">
        <p>Nenhum produto encontrado.</p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} className="w-full" />
      ))}
    </div>
  )
}
