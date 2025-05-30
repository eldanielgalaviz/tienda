"use client"

import type React from "react"
import { useState } from "react"
import { Link } from "react-router-dom"
import { Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCart } from "../../hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"
import type { Product } from "../../types"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { addItem } = useCart()
  const { toast } = useToast()

  // ✅ VALIDACIÓN: Verificar que product existe y tiene las propiedades necesarias
  if (!product) {
    console.error("ProductCard: product prop is undefined")
    return (
      <div className="group block p-4 border border-red-200 rounded-md bg-red-50">
        <p className="text-red-600 text-sm">Error: Producto no disponible</p>
      </div>
    )
  }

  // ✅ VALIDACIÓN: Verificar propiedades críticas
  if (!product.id) {
    console.error("ProductCard: product.id is missing", product)
    return (
      <div className="group block p-4 border border-yellow-200 rounded-md bg-yellow-50">
        <p className="text-yellow-600 text-sm">Error: ID de producto faltante</p>
      </div>
    )
  }

  // ✅ VALORES POR DEFECTO para propiedades opcionales
  const safeProduct = {
    id: product.id,
    name: product.name || "Producto sin nombre",
    price: product.price || 0,
    images: product.images && product.images.length > 0 ? product.images : ["/placeholder.svg"],
    tags: product.tags || [],
    variants: product.variants && product.variants.length > 0 ? product.variants : [{ id: "default" }],
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      addItem({
        id: safeProduct.id,
        name: safeProduct.name,
        price: safeProduct.price,
        image: safeProduct.images[0],
        quantity: 1,
        variant: safeProduct.variants[0].id,
      })

      toast({
        title: "Producto añadido",
        description: `${safeProduct.name} ha sido añadido al carrito.`,
      })
    } catch (error) {
      console.error("Error adding to cart:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir el producto al carrito.",
        variant: "destructive",
      })
    }
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      toast({
        title: "Añadido a favoritos",
        description: `${safeProduct.name} ha sido añadido a tu lista de deseos.`,
      })
    } catch (error) {
      console.error("Error adding to wishlist:", error)
      toast({
        title: "Error",
        description: "No se pudo añadir a favoritos.",
        variant: "destructive",
      })
    }
  }

  return (
    <Link
      to={`/producto/${safeProduct.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-md mb-3">
        <img
          src={safeProduct.images[0]}
          alt={safeProduct.name}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            // ✅ FALLBACK: Si la imagen falla, usar placeholder
            const target = e.target as HTMLImageElement
            target.src = "/placeholder.svg"
          }}
        />

        {/* Product tags */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {safeProduct.tags.includes("nuevo") && (
            <span className="bg-black text-white text-xs px-2 py-1 rounded">NUEVO</span>
          )}
          {safeProduct.tags.includes("oferta") && (
            <span className="bg-red-600 text-white text-xs px-2 py-1 rounded">OFERTA</span>
          )}
        </div>

        {/* Quick actions */}
        <div
          className={`absolute bottom-0 left-0 right-0 bg-white/90 p-2 flex justify-between transition-all duration-300 ${
            isHovered ? "translate-y-0 opacity-100" : "translate-y-full opacity-0"
          }`}
        >
          <Button variant="outline" size="sm" className="flex-1 mr-1" onClick={handleAddToCart}>
            Añadir al carrito
          </Button>
          <Button variant="outline" size="icon" className="ml-1" onClick={handleAddToWishlist}>
            <Heart className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <h3 className="font-medium text-lg">{safeProduct.name}</h3>
      <p className="font-bold">${safeProduct.price.toLocaleString("es-MX")}</p>
    </Link>
  )
}

export default ProductCard