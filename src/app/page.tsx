// "use client"

// import { useState, useEffect } from "react";
// import Image from "next/image";
// import Link from "next/link";
// import { ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
// import { useCart } from "@/context/CartContext";
// import { useToast } from "@/components/ui/use-toast"; // Asegúrate de tener este componente

// export default function HomePage() {
//   const [featuredProducts, setFeaturedProducts] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [currentPage, setCurrentPage] = useState(0);
//   const productsPerPage = 4;
  
//   // Usar el contexto del carrito
//   const { addToCart } = useCart();
  
//   // Para mostrar notificaciones
//   const { toast } = useToast();

//   // Cargar productos destacados desde la API
//   useEffect(() => {
//     const fetchTopProducts = async () => {
//       try {
//         setIsLoading(true);
//         const response = await fetch('/api/products/top?limit=12');
//         if (!response.ok) {
//           throw new Error('Error al cargar productos destacados');
//         }
//         const data = await response.json();
//         setFeaturedProducts(data.products);
//       } catch (error) {
//         console.error('Error al cargar productos destacados:', error);
//       } finally {
//         setIsLoading(false);
//       }
//     };

//     fetchTopProducts();
//   }, []);

//   // Calculamos cuántas páginas de productos tenemos
//   const totalPages = Math.ceil(featuredProducts.length / productsPerPage);
  
//   // Calculamos qué productos mostrar en la página actual
//   const displayedProducts = featuredProducts.slice(
//     currentPage * productsPerPage,
//     (currentPage + 1) * productsPerPage
//   );

//   // Funciones de navegación para el carrusel
//   const nextPage = () => {
//     setCurrentPage((prev) => (prev + 1) % totalPages);
//   };

//   const prevPage = () => {
//     setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
//   };

//   // Función para formatear el precio
//   const formatPrice = (price) => {
//     return parseFloat(price).toLocaleString('es-MX', {
//       style: 'currency',
//       currency: 'MXN',
//       minimumFractionDigits: 0,
//       maximumFractionDigits: 0
//     });
//   };

//   // Función para manejar la adición de productos al carrito
//   const handleAddToCart = (e, product) => {
//     e.preventDefault(); // Prevenir la navegación
    
//     // Agregar el producto al carrito
//     addToCart(product);
    
//     // Mostrar notificación
//     toast({
//       title: "Producto añadido",
//       description: `${product.name} ha sido añadido a tu carrito.`,
//       duration: 3000,
//     });
//   };

//   return (
//     <main className="flex-1">
//       {/* Hero Section */}
//       <section className="relative h-[70vh] flex items-center">
//         <div className="absolute inset-0 z-0 bg-black">
//           <div className="relative w-full h-full">
//             {/* Video de fondo */}
//             <video 
//               className="absolute inset-0 w-full h-full object-cover opacity-80"
//               autoPlay 
//               loop 
//               muted 
//               playsInline
//             >
//               {/* Puedes incluir múltiples fuentes de video para compatibilidad con diferentes navegadores */}
//               <source src="/video/jordan.mp4" type="video/mp4" />
//               {/* Imagen de respaldo si el video no se puede reproducir */}
//               Your browser does not support the video tag.
//             </video>
//           </div>
//         </div>

//         <div className="container mx-auto px-4 relative z-10 text-white">
//           <h1 className="text-4xl md:text-6xl font-bold mb-4">
//             Descubre lo Exclusivo
//           </h1>
//           <p className="text-xl md:text-2xl mb-8 max-w-2xl">
//             Sneakers de edición limitada y moda urbana que no encontrarás en
//             ningún otro lugar.
//           </p>
//           <div className="flex flex-wrap gap-4">
//             <Link
//               href="/tienda"
//               className="bg-white text-black px-6 py-3 rounded-md font-medium hover:bg-opacity-90 transition-colors"
//             >
//               Comprar Ahora
//             </Link>
//             <Link
//               href="/nuevo"
//               className="border border-white px-6 py-3 rounded-md font-medium hover:bg-white hover:bg-opacity-10 transition-colors"
//             >
//               Novedades
//             </Link>
//           </div>
//         </div>
//       </section>

//       {/* Featured Products */}
//       <section className="py-16">
//         <div className="container mx-auto px-4">
//           <div className="flex justify-between items-center mb-8">
//             <h2 className="text-2xl font-bold">Productos Más Vendidos</h2>
//             <div className="flex gap-2">
//               <button
//                 className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
//                 aria-label="Previous"
//                 onClick={prevPage}
//                 disabled={isLoading || featuredProducts.length <= productsPerPage}
//               >
//                 <ChevronLeft className="h-5 w-5" />
//               </button>
//               <button
//                 className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
//                 aria-label="Next"
//                 onClick={nextPage}
//                 disabled={isLoading || featuredProducts.length <= productsPerPage}
//               >
//                 <ChevronRight className="h-5 w-5" />
//               </button>
//             </div>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
//             {isLoading ? (
//               // Mostrar esqueletos de carga mientras se cargan los productos
//               Array.from({ length: 4 }).map((_, i) => (
//                 <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
//                   <div className="aspect-square bg-slate-200"></div>
//                   <div className="p-4">
//                     <div className="h-5 bg-slate-200 rounded mb-2"></div>
//                     <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
//                     <div className="flex justify-between items-center">
//                       <div className="h-6 bg-slate-200 rounded w-1/4"></div>
//                       <div className="h-8 bg-slate-200 rounded w-1/4"></div>
//                     </div>
//                   </div>
//                 </div>
//               ))
//             ) : featuredProducts.length === 0 ? (
//               <div className="col-span-4 text-center py-12 text-slate-500">
//                 No hay productos disponibles en este momento.
//               </div>
//             ) : (
//               // Mostrar productos destacados
//               displayedProducts.map((product) => (
//                 <Link 
//                   key={product.id} 
//                   href={`/producto/${product.slug}`}
//                   className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
//                 >
//                   <div className="aspect-square relative bg-slate-100">
//                     {product.image_url ? (
//                       <Image
//                         src={product.image_url}
//                         alt={product.name}
//                         fill
//                         sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
//                         style={{ objectFit: "cover" }}
//                         className="group-hover:scale-105 transition-transform duration-300"
//                       />
//                     ) : (
//                       <div className="absolute inset-0 flex items-center justify-center text-slate-400">
//                         Imagen no disponible
//                       </div>
//                     )}
                    
//                     {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
//                       <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
//                         Oferta
//                       </div>
//                     )}
//                   </div>
//                   <div className="p-4">
//                     <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
//                     <p className="text-sm text-slate-500 mb-2">{product.brand_name || 'Sin marca'}</p>
//                     <div className="flex justify-between items-center">
//                       <div>
//                         {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) ? (
//                           <>
//                             <span className="font-bold">{formatPrice(parseFloat(product.price))}</span>
//                             <span className="text-sm text-slate-500 line-through ml-2">
//                               {formatPrice(parseFloat(product.compare_at_price))}
//                             </span>
//                           </>
//                         ) : (
//                           <span className="font-bold">{formatPrice(parseFloat(product.price))}</span>
//                         )}
//                       </div>
//                       <button 
//                         className="text-sm font-medium bg-black text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors flex items-center"
//                         onClick={(e) => handleAddToCart(e, product)}
//                       >
//                         <ShoppingCart className="h-3 w-3 mr-1" />
//                         Añadir
//                       </button>
//                     </div>
//                   </div>
//                 </Link>
//               ))
//             )}
//           </div>
//         </div>
//       </section>
//     </main>
//   );
// }
// src/app/page.tsx
"use client"

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Loader2, ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";
import Footer from '../components/layout/Footer';

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);
  const productsPerPage = 4;
  
  // Usar el contexto del carrito
  const { addToCart } = useCart();

  // Cargar productos destacados desde la API
  useEffect(() => {
    const fetchTopProducts = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/products/top?limit=12');
        if (!response.ok) {
          throw new Error('Error al cargar productos destacados');
        }
        const data = await response.json();
        setFeaturedProducts(data.products);
      } catch (error) {
        console.error('Error al cargar productos destacados:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopProducts();
  }, []);

  // Calculamos cuántas páginas de productos tenemos
  const totalPages = Math.ceil(featuredProducts.length / productsPerPage);
  
  // Calculamos qué productos mostrar en la página actual
  const displayedProducts = featuredProducts.slice(
    currentPage * productsPerPage,
    (currentPage + 1) * productsPerPage
  );

  // Funciones de navegación para el carrusel
  const nextPage = () => {
    setCurrentPage((prev) => (prev + 1) % totalPages);
  };

  const prevPage = () => {
    setCurrentPage((prev) => (prev - 1 + totalPages) % totalPages);
  };

  // Función para formatear el precio
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Función para manejar la adición de productos al carrito
  const handleAddToCart = (e, product) => {
    e.preventDefault(); // Prevenir la navegación
    
    // Agregar el producto al carrito
    addToCart(product);
    
    // Mostrar notificación o feedback
    alert(`${product.name} ha sido añadido a tu carrito.`);
  };

  return (
    <main className="flex-1">
      {/* Hero Section */}
      <section className="relative h-[70vh] flex items-center">
        <div className="absolute inset-0 z-0 bg-black">
          <div className="relative w-full h-full">
            {/* Video de fondo */}
            <video 
              className="absolute inset-0 w-full h-full object-cover opacity-80"
              autoPlay 
              loop 
              muted 
              playsInline
            >
              {/* Puedes incluir múltiples fuentes de video para compatibilidad con diferentes navegadores */}
              <source src="/video/jordan.mp4" type="video/mp4" />
              {/* Imagen de respaldo si el video no se puede reproducir */}
              Your browser does not support the video tag.
            </video>
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
            <h2 className="text-2xl font-bold">Productos Más Vendidos</h2>
            <div className="flex gap-2">
              <button
                className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Previous"
                onClick={prevPage}
                disabled={isLoading || featuredProducts.length <= productsPerPage}
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                className="p-2 border rounded-full hover:bg-slate-100 transition-colors"
                aria-label="Next"
                onClick={nextPage}
                disabled={isLoading || featuredProducts.length <= productsPerPage}
              >
                <ChevronRight className="h-5 w-5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {isLoading ? (
              // Mostrar esqueletos de carga mientras se cargan los productos
              Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="border rounded-lg overflow-hidden animate-pulse">
                  <div className="aspect-square bg-slate-200"></div>
                  <div className="p-4">
                    <div className="h-5 bg-slate-200 rounded mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-1/2 mb-4"></div>
                    <div className="flex justify-between items-center">
                      <div className="h-6 bg-slate-200 rounded w-1/4"></div>
                      <div className="h-8 bg-slate-200 rounded w-1/4"></div>
                    </div>
                  </div>
                </div>
              ))
            ) : featuredProducts.length === 0 ? (
              <div className="col-span-4 text-center py-12 text-slate-500">
                No hay productos disponibles en este momento.
              </div>
            ) : (
              // Mostrar productos destacados
              displayedProducts.map((product) => (
                <Link 
                  key={product.id} 
                  href={`/producto/${product.slug}`}
                  className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative bg-slate-100">
                    {product.image ? (
                      <Image
                        src={product.image}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        Imagen no disponible
                      </div>
                    )}
                    
                    {product.compareAtPrice && product.compareAtPrice > product.price && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Oferta
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">{product.brand}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.compareAtPrice && product.compareAtPrice > product.price ? (
                          <>
                            <span className="font-bold">{formatPrice(product.price)}</span>
                            <span className="text-sm text-slate-500 line-through ml-2">
                              {formatPrice(product.compareAtPrice)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <button 
                        className="text-sm font-medium bg-black text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors flex items-center"
                        onClick={(e) => handleAddToCart(e, product)}
                      >
                        <ShoppingCart className="h-3 w-3 mr-1" />
                        Añadir
                      </button>
                    </div>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      </section>
      <Footer />
    </main>
  
  );


}