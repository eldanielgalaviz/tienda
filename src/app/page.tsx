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
  {
    id: "3",
    name: "Adidas Superstar",
    price: 1999,
    images: ["/placeholder.svg?height=300&width=300"],
  },
  {
    id: "4",
    name: "Puma RS-X",
    price: 2299,
    images: ["/placeholder.svg?height=300&width=300"],
    discount: 15,
  },
]

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[600px] flex items-center justify-center bg-gray-100">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">Descubre tu Estilo</h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8">Las mejores marcas de sneakers y moda urbana</p>
          <a
            href="/tienda"
            className="inline-flex items-center justify-center h-12 px-8 font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
          >
            Comprar Ahora
          </a>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Productos Destacados</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {mockProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </section>

      {/* Categories */}
      <section className="py-24 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8">Categorías</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {["Sneakers", "Ropa", "Accesorios"].map((category) => (
              <a
                key={category}
                href={`/tienda?categoria=${category.toLowerCase()}`}
                className="relative h-64 group overflow-hidden rounded-lg"
              >
                <div className="absolute inset-0 bg-gray-200 group-hover:scale-105 transition-transform duration-300">
                  {/* Aquí irían las imágenes de las categorías */}
                </div>
                <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center">
                  <h3 className="text-2xl font-bold text-white">{category}</h3>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Newsletter */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl font-bold mb-4">Únete a Nuestra Newsletter</h2>
            <p className="text-gray-600 mb-8">Suscríbete para recibir las últimas novedades y ofertas exclusivas</p>
            <form className="flex gap-2">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 h-12 px-4 rounded-full border focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="h-12 px-8 font-medium text-white bg-black rounded-full hover:bg-gray-800 transition-colors"
              >
                Suscribirse
              </button>
            </form>
          </div>
        </div>
      </section>
    </main>
  )
}

