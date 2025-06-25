"use client"

import type React from "react"

import { useState } from "react"
import Image from "next/image"
import Link from "next/link"
import { Heart, ShoppingCart } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

import { useCart } from "@/hooks/use-cart"; 


import type { Product } from "@/types"

interface ProductCardProps {
  product: Product
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [isHovered, setIsHovered] = useState(false)
  const { toast } = useToast()
  const { addItem } = useCart()

  if (!product) {
    return null
  }

  const handleAddToCart = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    addItem({
      id: product.id,
      name: product.name,
      price: product.price,
      image: product.images?.[0],
      quantity: 1,
      variant: "default",
      variantName: "",
    })

    toast({
      title: "Producto añadido",
      description: `${product.name} ha sido añadido al carrito.`,
    })
  }

  const handleAddToWishlist = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    toast({
      title: "Añadido a favoritos",
      description: `${product.name} ha sido añadido a tu lista de favoritos.`,
    })
  }

  const discountedPrice = product.discount ? product.price - (product.price * product.discount) / 100 : null

  return (
    <Link
      href={`/producto/${product.id}`}
      className="group block"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="relative overflow-hidden rounded-lg bg-white">
        {product.discount && (
          <div className="absolute top-2 left-2 z-10 bg-red-500 text-white text-xs font-bold px-2 py-1 rounded">
            -{product.discount}%
          </div>
        )}

        {product.isNew && (
          <div className="absolute top-2 right-2 z-10 bg-black text-white text-xs font-bold px-2 py-1 rounded">
            Nuevo
          </div>
        )}

        <div className="aspect-square overflow-hidden">
          <div className="relative w-full h-full">
            <Image
              src={
                isHovered && product.images && product.images.length > 1
                  ? product.images[1]
                  : product.images?.[0] || "/placeholder.svg"
              }
              alt={product.name}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
            />
          </div>
        </div>

        <div
          className={`absolute bottom-0 left-0 right-0 flex justify-between p-2 bg-white bg-opacity-90 transition-all duration-300 ${
            isHovered ? "opacity-100 translate-y-0" : "opacity-0 translate-y-full"
          }`}
        >
          <Button variant="outline" size="icon" className="rounded-full" onClick={handleAddToWishlist}>
            <Heart className="h-4 w-4" />
            <span className="sr-only">Añadir a favoritos</span>
          </Button>

          <Button size="sm" className="rounded-full" onClick={handleAddToCart}>
            <ShoppingCart className="h-4 w-4 mr-2" />
            Añadir
          </Button>
        </div>
      </div>

      <div className="mt-3 space-y-1">
        <h3 className="font-medium text-gray-900 group-hover:underline">{product.name}</h3>

        <div className="flex items-center">
          {discountedPrice ? (
            <>
              <span className="font-bold">${discountedPrice.toLocaleString("es-MX")}</span>
              <span className="ml-2 text-sm text-gray-500 line-through">${product.price.toLocaleString("es-MX")}</span>
            </>
          ) : (
            <span className="font-bold">${product.price.toLocaleString("es-MX")}</span>
          )}
        </div>
      </div>
    </Link>
  )
}

export default ProductCard

