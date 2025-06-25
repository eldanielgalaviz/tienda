"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link";
import { Trash2, Plus, Minus, ArrowRight, ShoppingBag } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"

const CartPage = () => {
  const { items, removeItem, updateQuantity, getTotal, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()
  const [couponCode, setCouponCode] = useState("")
  const [isApplyingCoupon, setIsApplyingCoupon] = useState(false)

  const handleRemoveItem = (id: string, variant: string) => {
    removeItem(id, variant)
    toast({
      title: "Producto eliminado",
      description: "El producto ha sido eliminado del carrito.",
    })
  }

  const handleQuantityChange = (id: string, variant: string, newQuantity: number) => {
    if (newQuantity < 1) return
    updateQuantity(id, variant, newQuantity)
  }

  const handleApplyCoupon = () => {
    if (!couponCode) return

    setIsApplyingCoupon(true)

    // Simulación de aplicación de cupón
    setTimeout(() => {
      setIsApplyingCoupon(false)
      toast({
        title: "Cupón inválido",
        description: "El código de cupón ingresado no es válido o ha expirado.",
        variant: "destructive",
      })
    }, 1000)
  }

  const subtotal = getTotal()
  const shipping = subtotal > 1999 ? 0 : 150
  const total = subtotal + shipping

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-24 text-center">
        <div className="max-w-md mx-auto">
          <ShoppingBag className="h-16 w-16 mx-auto mb-6 text-gray-300" />
          <h1 className="text-2xl font-bold mb-4">Tu carrito está vacío</h1>
          <p className="text-gray-600 mb-8">Parece que aún no has añadido ningún producto a tu carrito.</p>
          <Link to="/tienda">
            <Button size="lg">Continuar comprando</Button>
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Carrito de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="rounded-lg border overflow-hidden">
            <div className="hidden md:grid grid-cols-12 gap-4 p-4 bg-muted/50">
              <div className="col-span-6">
                <span className="font-medium">Producto</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium">Precio</span>
              </div>
              <div className="col-span-2 text-center">
                <span className="font-medium">Cantidad</span>
              </div>
              <div className="col-span-2 text-right">
                <span className="font-medium">Subtotal</span>
              </div>
            </div>

            <div className="divide-y">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                    <div className="col-span-6 flex items-center gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-md"
                      />
                      <div>
                        <h3 className="font-medium">{item.name}</h3>
                        {item.variantName && <p className="text-sm text-gray-600">{item.variantName}</p>}
                      </div>
                    </div>

                    <div className="md:col-span-2 md:text-center flex justify-between md:block">
                      <span className="md:hidden font-medium">Precio:</span>
                      <span>${item.price.toLocaleString("es-MX")}</span>
                    </div>

                    <div className="md:col-span-2 md:text-center flex justify-between md:block">
                      <span className="md:hidden font-medium">Cantidad:</span>
                      <div className="flex items-center border rounded-md w-32 mx-auto">
                        <button
                          className="w-8 h-8 flex items-center justify-center border-r"
                          onClick={() => handleQuantityChange(item.id, item.variant, item.quantity - 1)}
                        >
                          <Minus className="h-3 w-3" />
                        </button>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) =>
                            handleQuantityChange(item.id, item.variant, Number.parseInt(e.target.value) || 1)
                          }
                          className="w-16 h-8 text-center focus:outline-none"
                        />
                        <button
                          className="w-8 h-8 flex items-center justify-center border-l"
                          onClick={() => handleQuantityChange(item.id, item.variant, item.quantity + 1)}
                        >
                          <Plus className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    <div className="md:col-span-2 md:text-right flex justify-between md:block">
                      <span className="md:hidden font-medium">Subtotal:</span>
                      <div className="flex items-center gap-2 justify-end">
                        <span className="font-medium">${(item.price * item.quantity).toLocaleString("es-MX")}</span>
                        <button
                          onClick={() => handleRemoveItem(item.id, item.variant)}
                          className="text-gray-500 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row justify-between items-center mt-6 gap-4">
            <Link to="/tienda">
              <Button variant="outline">Continuar comprando</Button>
            </Link>
            <Button variant="outline" onClick={clearCart}>
              Vaciar carrito
            </Button>
          </div>
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6">
            <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>

            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString("es-MX")}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{shipping === 0 ? "Gratis" : `$${shipping.toLocaleString("es-MX")}`}</span>
              </div>
            </div>

            <Separator className="my-4" />

            <div className="flex justify-between font-bold mb-6">
              <span>Total</span>
              <span>${total.toLocaleString("es-MX")}</span>
            </div>

            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Código de cupón"
                  value={couponCode}
                  onChange={(e) => setCouponCode(e.target.value)}
                />
                <Button variant="outline" onClick={handleApplyCoupon} disabled={isApplyingCoupon || !couponCode}>
                  Aplicar
                </Button>
              </div>

              <Button className="w-full" size="lg" onClick={() => router.push("/checkout")}>
                Proceder al pago
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CartPage

