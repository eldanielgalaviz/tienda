import ProductCard from "@/components/product/ProductCard"

const mockProducts = [
  {
    id: "1",
    name: "Air Jordan 1 High OG",
    price: 3999,
    images: ["/placeholder.svg?height=300&width=300"],
    discount: 10,
    isNew: true,
  },
  {
    id: "2",
    name: "Nike Dunk Low Green",
    price: 2499,
    images: ["/placeholder.svg?height=300&width=300"],
    isNew: true,
  },
  // Añade más productos mock aquí
]

export default function TiendaPage() {
  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Nuestra Colección</h1>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {mockProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </div>
  )
}

