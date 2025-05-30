"use client"

import { useState, useEffect } from "react"
import { useParams } from "react-router-dom"
import { ChevronLeft, ChevronRight, Star, Truck, ShieldCheck, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"
import ProductCard from "@/components/product/ProductCard"
import type { Product } from "@/types"

const ProductPage = () => {
  const { id } = useParams<{ id: string }>()
  const [product, setProduct] = useState<Product | null>(null)
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([])
  const [selectedVariant, setSelectedVariant] = useState<string>("")
  const [quantity, setQuantity] = useState(1)
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const { addItem } = useCart()
  const { toast } = useToast()

  useEffect(() => {
    // Simulación de carga de datos
    const fetchProduct = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a la API
        // const response = await fetch(`/api/products/${id}`)
        // const data = await response.json()

        // Datos de ejemplo
        const mockProduct: Product = {
          id: "1",
          name: 'Air Jordan 1 High OG "University Blue"',
          price: 3999,
          description:
            'El Air Jordan 1 High OG "University Blue" presenta una parte superior de cuero blanco con superposiciones de gamuza University Blue y un Swoosh negro. Un logotipo de Wings negro en el tobillo, una lengüeta de marca Nike Air y una entresuela blanca con suela University Blue completan el diseño.',
          images: [
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
            "/placeholder.svg?height=600&width=600",
          ],
          category: "sneakers",
          tags: ["nuevo", "destacado"],
          stock: 10,
          variants: [
            { id: "1-1", name: "Talla 7", price: 3999, stock: 2 },
            { id: "1-2", name: "Talla 8", price: 3999, stock: 3 },
            { id: "1-3", name: "Talla 9", price: 3999, stock: 5 },
            { id: "1-4", name: "Talla 10", price: 3999, stock: 0 },
          ],
          specifications: [
            { name: "Material", value: "Cuero y gamuza" },
            { name: "Color", value: "Blanco / University Blue / Negro" },
            { name: "Estilo", value: "555088-134" },
            { name: "Lanzamiento", value: "2021" },
          ],
        }

        setProduct(mockProduct)
        setSelectedVariant(mockProduct.variants[0].id)

        // Productos relacionados de ejemplo
        const mockRelatedProducts: Product[] = [
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

        setRelatedProducts(mockRelatedProducts)
      } catch (error) {
        console.error("Error fetching product:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProduct()
  }, [id])

  const handleAddToCart = () => {
    if (!product) return

    const variant = product.variants.find((v) => v.id === selectedVariant)
    if (!variant) return

    addItem({
      id: product.id,
      name: product.name,
      price: variant.price,
      image: product.images[0],
      quantity,
      variant: selectedVariant,
      variantName: variant.name,
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} (${variant.name}) ha sido añadido al carrito.`,
    })
  }

  const handleAddToWishlist = () => {
    if (!product) return

    toast({
      title: "Añadido a favoritos",
      description: `${product.name} ha sido añadido a tu lista de deseos.`,
    })
  }

  const nextImage = () => {
    if (!product) return
    setCurrentImageIndex((prev) => (prev + 1) % product.images.length)
  }

  const prevImage = () => {
    if (!product) return
    setCurrentImageIndex((prev) => (prev - 1 + product.images.length) % product.images.length)
  }

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-24">
        <div className="animate-pulse">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-gray-200 aspect-square"></div>
            <div>
              <div className="h-8 bg-gray-200 rounded mb-4"></div>
              <div className="h-6 bg-gray-200 rounded mb-4 w-1/4"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-2"></div>
              <div className="h-4 bg-gray-200 rounded mb-6 w-3/4"></div>
              <div className="h-10 bg-gray-200 rounded mb-4"></div>
              <div className="h-12 bg-gray-200 rounded mb-4"></div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p>Lo sentimos, el producto que buscas no existe o ha sido eliminado.</p>
      </div>
    )
  }

  return (
    <div className="pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Product Images */}
          <div>
            <div className="relative">
              <div className="aspect-square overflow-hidden rounded-lg border mb-4">
                <img
                  src={product.images[currentImageIndex] || "/placeholder.svg"}
                  alt={product.name}
                  className="w-full h-full object-cover"
                />
              </div>

              {product.images.length > 1 && (
                <>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute left-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80"
                    onClick={prevImage}
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    className="absolute right-2 top-1/2 -translate-y-1/2 rounded-full bg-white/80"
                    onClick={nextImage}
                  >
                    <ChevronRight className="h-5 w-5" />
                  </Button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {product.images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {product.images.map((image, index) => (
                  <button
                    key={index}
                    className={`border rounded-md overflow-hidden ${
                      index === currentImageIndex ? "ring-2 ring-black" : ""
                    }`}
                    onClick={() => setCurrentImageIndex(index)}
                  >
                    <img
                      src={image || "/placeholder.svg"}
                      alt={`${product.name} - Vista ${index + 1}`}
                      className="w-full aspect-square object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div>
            {/* Tags */}
            <div className="flex gap-2 mb-3">
              {product.tags.includes("nuevo") && (
                <span className="bg-black text-white text-xs px-2 py-1 rounded">NUEVO</span>
              )}
              {product.tags.includes("oferta") && (
                <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">OFERTA</span>
              )}
            </div>

            <h1 className="text-3xl font-bold mb-2">{product.name}</h1>

            {/* Rating */}
            <div className="flex items-center gap-1 mb-4">
              <div className="flex">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="h-5 w-5 text-yellow-400 fill-yellow-400" />
                ))}
              </div>
              <span className="text-sm text-gray-600">(24 reseñas)</span>
            </div>

            <p className="text-2xl font-bold mb-6">${product.price.toLocaleString("es-MX")}</p>

            <p className="text-gray-600 mb-6">{product.description}</p>

            {/* Variants */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Talla:</h3>
              <RadioGroup value={selectedVariant} onValueChange={setSelectedVariant} className="flex flex-wrap gap-2">
                {product.variants.map((variant) => (
                  <div key={variant.id}>
                    <RadioGroupItem
                      value={variant.id}
                      id={variant.id}
                      className="sr-only peer"
                      disabled={variant.stock === 0}
                    />
                    <Label
                      htmlFor={variant.id}
                      className="flex h-10 w-16 cursor-pointer items-center justify-center rounded-md border border-gray-200 bg-white text-sm font-medium peer-data-[state=checked]:border-black peer-data-[state=checked]:bg-black peer-data-[state=checked]:text-white peer-disabled:cursor-not-allowed peer-disabled:opacity-50"
                    >
                      {variant.name.replace("Talla ", "")}
                    </Label>
                  </div>
                ))}
              </RadioGroup>
            </div>

            {/* Quantity */}
            <div className="mb-6">
              <h3 className="font-medium mb-2">Cantidad:</h3>
              <div className="flex items-center border rounded-md w-32">
                <button
                  className="w-10 h-10 flex items-center justify-center border-r"
                  onClick={() => setQuantity((prev) => Math.max(1, prev - 1))}
                >
                  -
                </button>
                <input
                  type="number"
                  min="1"
                  value={quantity}
                  onChange={(e) => setQuantity(Math.max(1, Number.parseInt(e.target.value) || 1))}
                  className="w-12 h-10 text-center focus:outline-none"
                />
                <button
                  className="w-10 h-10 flex items-center justify-center border-l"
                  onClick={() => setQuantity((prev) => prev + 1)}
                >
                  +
                </button>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-col sm:flex-row gap-3 mb-8">
              <Button size="lg" className="flex-1" onClick={handleAddToCart}>
                Añadir al carrito
              </Button>
              <Button variant="outline" size="lg" className="flex items-center gap-2" onClick={handleAddToWishlist}>
                <Heart className="h-5 w-5" />
                Añadir a favoritos
              </Button>
            </div>

            {/* Features */}
            <div className="space-y-4 border-t pt-6">
              <div className="flex items-start gap-3">
                <Truck className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium">Envío gratis</h4>
                  <p className="text-sm text-gray-600">En compras mayores a $1,999 MXN</p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 mt-0.5" />
                <div>
                  <h4 className="font-medium">Garantía de autenticidad</h4>
                  <p className="text-sm text-gray-600">Todos nuestros productos son 100% auténticos</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Product Details Tabs */}
        <div className="mt-16">
          <Tabs defaultValue="details">
            <TabsList className="w-full justify-start border-b rounded-none h-auto p-0 bg-transparent">
              <TabsTrigger
                value="details"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
              >
                Detalles
              </TabsTrigger>
              <TabsTrigger
                value="specifications"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
              >
                Especificaciones
              </TabsTrigger>
              <TabsTrigger
                value="reviews"
                className="rounded-none border-b-2 border-transparent data-[state=active]:border-black data-[state=active]:bg-transparent data-[state=active]:shadow-none py-3"
              >
                Reseñas (24)
              </TabsTrigger>
            </TabsList>
            <TabsContent value="details" className="pt-6">
              <div className="prose max-w-none">
                <p>{product.description}</p>
                <p>
                  Los Air Jordan 1 son uno de los modelos más icónicos en la historia del calzado deportivo. Diseñados
                  originalmente para Michael Jordan en 1985, estos tenis revolucionaron la industria y se convirtieron
                  en un símbolo cultural que trasciende el baloncesto.
                </p>
                <p>
                  Esta versión "University Blue" rinde homenaje a los colores de la Universidad de Carolina del Norte,
                  donde Jordan jugó antes de unirse a la NBA. El diseño combina cuero premium con detalles en gamuza
                  para un look elegante y duradero.
                </p>
              </div>
            </TabsContent>
            <TabsContent value="specifications" className="pt-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-bold text-lg mb-4">Características</h3>
                  <ul className="space-y-2">
                    <li className="flex justify-between py-2 border-b">
                      <span className="text-gray-600">Marca</span>
                      <span className="font-medium">Nike</span>
                    </li>
                    {product.specifications?.map((spec, index) => (
                      <li key={index} className="flex justify-between py-2 border-b">
                        <span className="text-gray-600">{spec.name}</span>
                        <span className="font-medium">{spec.value}</span>
                      </li>
                    ))}
                  </ul>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Cuidados</h3>
                  <ul className="space-y-2 list-disc pl-5">
                    <li>Limpiar con un paño húmedo y jabón suave</li>
                    <li>No usar blanqueador ni productos químicos fuertes</li>
                    <li>Dejar secar a temperatura ambiente</li>
                    <li>Guardar en un lugar fresco y seco</li>
                    <li>Evitar la exposición prolongada al sol</li>
                  </ul>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="reviews" className="pt-6">
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-lg">Reseñas de clientes</h3>
                  <Button>Escribir una reseña</Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Review example */}
                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">Hace 2 semanas</span>
                    </div>
                    <h4 className="font-bold">Excelente calidad</h4>
                    <p className="text-sm text-gray-600 mb-2">Por Juan P.</p>
                    <p>
                      Increíbles sneakers, la calidad es excelente y son muy cómodos. Definitivamente los recomiendo.
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex justify-between mb-2">
                      <div className="flex items-center gap-1">
                        {[...Array(4)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-yellow-400 fill-yellow-400" />
                        ))}
                        {[...Array(1)].map((_, i) => (
                          <Star key={i} className="h-4 w-4 text-gray-300" />
                        ))}
                      </div>
                      <span className="text-sm text-gray-500">Hace 1 mes</span>
                    </div>
                    <h4 className="font-bold">Muy buenos, pero...</h4>
                    <p className="text-sm text-gray-600 mb-2">Por María L.</p>
                    <p>
                      Me encantan estos tenis, pero vienen un poco grandes de la talla. Recomendaría pedir media talla
                      menos.
                    </p>
                  </div>
                </div>

                <div className="text-center">
                  <Button variant="outline">Ver más reseñas</Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>

        {/* Related Products */}
        <div className="mt-16">
          <h2 className="text-2xl font-bold mb-6">Productos relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {relatedProducts.map((product) => (
              <ProductCard key={product.id} product={product} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ProductPage

