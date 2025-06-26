//src/page/HomePge.tsx
"use client"

import { useState, useEffect } from "react"
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import ProductCard from "@/components/product/ProductCard"
import type { Product } from "@/types"

const HomePage = () => {
  const [newArrivals, setNewArrivals] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Simulación de carga de datos
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a la API
        // const response = await fetch('/api/products?filter=new')
        // const data = await response.json()

        // Datos de ejemplo
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Air Jordan 1 High OG",
            price: 3999,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "destacado"],
            stock: 10,
            variants: [
              { id: "1-1", name: "Talla 7", price: 3999, stock: 2 },
              { id: "1-2", name: "Talla 8", price: 3999, stock: 3 },
              { id: "1-3", name: "Talla 9", price: 3999, stock: 5 },
            ],
          },
          {
            id: "2",
            name: "Nike Dunk Low Green",
            price: 2499,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo"],
            stock: 15,
            variants: [
              { id: "2-1", name: "Talla 7", price: 2499, stock: 5 },
              { id: "2-2", name: "Talla 8", price: 2499, stock: 5 },
              { id: "2-3", name: "Talla 9", price: 2499, stock: 5 },
            ],
          },
          {
            id: "3",
            name: "Air Jordan 1 Mid SE",
            price: 2799,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "oferta"],
            stock: 8,
            variants: [
              { id: "3-1", name: "Talla 7", price: 2799, stock: 3 },
              { id: "3-2", name: "Talla 8", price: 2799, stock: 3 },
              { id: "3-3", name: "Talla 9", price: 2799, stock: 2 },
            ],
          },
          {
            id: "4",
            name: "Adidas Superstar",
            price: 1999,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "oferta"],
            stock: 20,
            variants: [
              { id: "4-1", name: "Talla 7", price: 1999, stock: 7 },
              { id: "4-2", name: "Talla 8", price: 1999, stock: 7 },
              { id: "4-3", name: "Talla 9", price: 1999, stock: 6 },
            ],
          },
        ]

        setNewArrivals(mockProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [])

  return (
    <div className="pt-16">
      {/* Hero Section */}
      <section className="relative h-[80vh] bg-gray-100">
        <div className="absolute inset-0">
          <img src="/placeholder.svg?height=800&width=1600" alt="Sneakers" className="w-full h-full object-cover" />
          <div className="absolute inset-0 bg-black/30"></div>
        </div>

        <div className="relative h-full flex flex-col items-center justify-center text-center text-white px-4">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">MODELOS EXCLUSIVOS</h1>
          <p className="text-lg md:text-xl mb-8 max-w-2xl">Descubre nuestra colección de sneakers y ropa exclusiva</p>
          <Button size="lg" className="bg-white text-black hover:bg-gray-200">
            COMPRAR AHORA
          </Button>
        </div>
      </section>

      {/* Ticker Banner */}
      <div className="bg-black text-white py-3 overflow-hidden whitespace-nowrap">
        <div className="animate-marquee inline-block">
          <span className="mx-4">Sneakers</span>
          <span className="mx-4">Fashion Treats</span>
          <span className="mx-4">Envíos Gratis a Todo México</span>
          <span className="mx-4">Modelos Exclusivos</span>
          <span className="mx-4">Fashion Treats</span>
          <span className="mx-4">Sneakers</span>
          <span className="mx-4">Envíos Gratis a Todo México</span>
        </div>
        <div className="animate-marquee2 inline-block">
          <span className="mx-4">Sneakers</span>
          <span className="mx-4">Fashion Treats</span>
          <span className="mx-4">Envíos Gratis a Todo México</span>
          <span className="mx-4">Modelos Exclusivos</span>
          <span className="mx-4">Fashion Treats</span>
          <span className="mx-4">Sneakers</span>
          <span className="mx-4">Envíos Gratis a Todo México</span>
        </div>
      </div>

      {/* New Arrivals Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold">LO MÁS NUEVO</h2>
            <div className="flex space-x-2">
              <Button variant="outline" size="icon" aria-label="Anterior">
                <ChevronLeft className="h-5 w-5" />
              </Button>
              <Button variant="outline" size="icon" aria-label="Siguiente">
                <ChevronRight className="h-5 w-5" />
              </Button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, index) => (
                <div key={index} className="animate-pulse">
                  <div className="bg-gray-200 aspect-square mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {newArrivals.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link to="/tienda">
              <Button variant="outline" size="lg">
                Ver Todos los Productos
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Categories Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold mb-8 text-center">CATEGORÍAS</h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Link to="/tienda?categoria=sneakers" className="group relative h-80 overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Sneakers"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">SNEAKERS</h3>
              </div>
            </Link>

            <Link to="/tienda?categoria=ropa" className="group relative h-80 overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Ropa"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">ROPA</h3>
              </div>
            </Link>

            <Link to="/tienda?categoria=accesorios" className="group relative h-80 overflow-hidden">
              <img
                src="/placeholder.svg?height=400&width=400"
                alt="Accesorios"
                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                <h3 className="text-white text-2xl font-bold">ACCESORIOS</h3>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Productos Auténticos</h3>
              <p className="text-gray-600">Garantizamos la autenticidad de todos nuestros productos.</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8 4-8-4V5l8 4 8-4v2z" />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Envío Gratis</h3>
              <p className="text-gray-600">Envío gratis en compras mayores a $1,999 MXN.</p>
            </div>

            <div className="text-center">
              <div className="bg-gray-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-bold mb-2">Pagos Seguros</h3>
              <p className="text-gray-600">Múltiples métodos de pago con seguridad garantizada.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="py-16 bg-black text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h2 className="text-3xl font-bold mb-4">SUSCRÍBETE A NUESTRO NEWSLETTER</h2>
            <p className="mb-6">Recibe las últimas noticias y ofertas exclusivas directamente en tu correo.</p>

            <form className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                placeholder="Tu correo electrónico"
                className="flex-1 px-4 py-3 rounded-md text-black focus:outline-none"
                required
              />
              <Button className="bg-white text-black hover:bg-gray-200">Suscribirse</Button>
            </form>
          </div>
        </div>
      </section>
    </div>
  )
}

export default HomePage

