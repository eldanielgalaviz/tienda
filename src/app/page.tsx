import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

export default function HomePage() {
  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="relative w-full h-full opacity-75">
            <Image
              src="/placeholder.jpg"
              alt="Hero Image"
              fill
              style={{ objectFit: "cover" }}
              priority
            />
          </div>
        </div>

        <div className="container mx-auto px-4 relative z-10 text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4">
            Descubre lo Exclusivo
          </h1>
          <p className="text-xl md:text-2xl mb-8 max-w-2xl">
            Sneakers de edición limitada y moda urbana que no encontrarás en
            ningún otro lugar.
          </p>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/tienda"
              className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
            >
              Comprar Ahora
            </Link>
            <Link
              href="/nuevo"
              className="border border-white px-6 py-3 rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
            >
              Novedades
            </Link>
          </div>
        </div>
      </section>

      {/* Featured Products */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-2xl font-bold">Productos Destacados</h2>
            <div className="flex gap-2">
              <button
                className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Previous"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Next"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {/* Sample Product Cards */}
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="border rounded-lg overflow-hidden group">
                <div className="aspect-square relative bg-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Imagen del Producto
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">Producto Ejemplo {i}</h3>
                  <p className="text-sm text-slate-500 mb-2">Marca</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">$129.99</span>
                    <button className="text-sm font-medium bg-black text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors">
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}