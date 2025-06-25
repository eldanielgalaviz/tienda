"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { CreditCard, Truck, Check, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useCart } from "@/hooks/use-cart"
import { useToast } from "@/components/ui/use-toast"

const CheckoutPage = () => {
  const { items, getTotal, clearCart } = useCart()
  const { toast } = useToast()
  const router = useRouter()

  const [activeStep, setActiveStep] = useState(1)
  const [isProcessing, setIsProcessing] = useState(false)

  // Datos de formulario
  const [shippingInfo, setShippingInfo] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    state: "",
    postalCode: "",
    country: "México",
  })

  const [shippingMethod, setShippingMethod] = useState("standard")
  const [paymentMethod, setPaymentMethod] = useState("card")

  const handleShippingInfoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setShippingInfo((prev) => ({ ...prev, [name]: value }))
  }

  const handleContinueToShipping = (e: React.FormEvent) => {
    e.preventDefault()
    setActiveStep(2)
    window.scrollTo(0, 0)
  }

  const handleContinueToPayment = () => {
    setActiveStep(3)
    window.scrollTo(0, 0)
  }

  const handlePlaceOrder = () => {
    setIsProcessing(true)

    // Simulación de procesamiento de pago
    setTimeout(() => {
      setIsProcessing(false)
      clearCart()

      toast({
        title: "¡Pedido realizado con éxito!",
        description: "Recibirás un correo con los detalles de tu compra.",
      })

      router.push("/cuenta/pedidos")
    }, 2000)
  }

  const subtotal = getTotal()
  const shipping = shippingMethod === "express" ? 250 : subtotal > 1999 ? 0 : 150
  const total = subtotal + shipping

  if (items.length === 0) {
    router.push("/carrito")
    return null
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <h1 className="text-2xl md:text-3xl font-bold mb-8">Checkout</h1>

      {/* Progress Steps */}
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-2xl mx-auto">
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= 1 ? "bg-black text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              1
            </div>
            <span className="text-sm mt-1">Información</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${activeStep >= 2 ? "bg-black" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= 2 ? "bg-black text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              2
            </div>
            <span className="text-sm mt-1">Envío</span>
          </div>
          <div className="flex-1 h-1 mx-2 bg-gray-200">
            <div className={`h-full ${activeStep >= 3 ? "bg-black" : "bg-gray-200"}`}></div>
          </div>
          <div className="flex flex-col items-center">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center ${
                activeStep >= 3 ? "bg-black text-white" : "bg-gray-200 text-gray-600"
              }`}
            >
              3
            </div>
            <span className="text-sm mt-1">Pago</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {/* Step 1: Customer Information */}
          {activeStep === 1 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">Información de Contacto</h2>

              <form onSubmit={handleContinueToShipping}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                  <div>
                    <Label htmlFor="firstName">Nombre</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={shippingInfo.firstName}
                      onChange={handleShippingInfoChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="lastName">Apellidos</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={shippingInfo.lastName}
                      onChange={handleShippingInfoChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      value={shippingInfo.email}
                      onChange={handleShippingInfoChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="phone">Teléfono</Label>
                    <Input
                      id="phone"
                      name="phone"
                      value={shippingInfo.phone}
                      onChange={handleShippingInfoChange}
                      required
                    />
                  </div>
                </div>

                <h2 className="text-xl font-bold mb-4">Dirección de Envío</h2>

                <div className="grid grid-cols-1 gap-4 mb-6">
                  <div>
                    <Label htmlFor="address">Dirección</Label>
                    <Input
                      id="address"
                      name="address"
                      value={shippingInfo.address}
                      onChange={handleShippingInfoChange}
                      required
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="city">Ciudad</Label>
                      <Input
                        id="city"
                        name="city"
                        value={shippingInfo.city}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado</Label>
                      <Input
                        id="state"
                        name="state"
                        value={shippingInfo.state}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="postalCode">Código Postal</Label>
                      <Input
                        id="postalCode"
                        name="postalCode"
                        value={shippingInfo.postalCode}
                        onChange={handleShippingInfoChange}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="country">País</Label>
                      <Input
                        id="country"
                        name="country"
                        value={shippingInfo.country}
                        onChange={handleShippingInfoChange}
                        disabled
                      />
                    </div>
                  </div>
                </div>

                <Button type="submit" className="w-full">
                  Continuar con el envío
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </form>
            </div>
          )}

          {/* Step 2: Shipping Method */}
          {activeStep === 2 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">Método de Envío</h2>

              <RadioGroup value={shippingMethod} onValueChange={setShippingMethod} className="space-y-4 mb-6">
                <div
                  className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer ${
                    shippingMethod === "standard" ? "border-black bg-gray-50" : ""
                  }`}
                >
                  <RadioGroupItem value="standard" id="standard" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="standard" className="flex items-center cursor-pointer">
                      <Truck className="h-5 w-5 mr-2" />
                      <span className="font-medium">Envío Estándar</span>
                      {subtotal > 1999 ? (
                        <span className="ml-auto font-medium text-green-600">Gratis</span>
                      ) : (
                        <span className="ml-auto font-medium">$150</span>
                      )}
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 ml-7">Entrega estimada: 3-5 días hábiles</p>
                  </div>
                </div>

                <div
                  className={`flex items-start space-x-3 border rounded-lg p-4 cursor-pointer ${
                    shippingMethod === "express" ? "border-black bg-gray-50" : ""
                  }`}
                >
                  <RadioGroupItem value="express" id="express" className="mt-1" />
                  <div className="flex-1">
                    <Label htmlFor="express" className="flex items-center cursor-pointer">
                      <Truck className="h-5 w-5 mr-2" />
                      <span className="font-medium">Envío Express</span>
                      <span className="ml-auto font-medium">$250</span>
                    </Label>
                    <p className="text-sm text-gray-600 mt-1 ml-7">Entrega estimada: 1-2 días hábiles</p>
                  </div>
                </div>
              </RadioGroup>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(1)}>
                  Volver
                </Button>
                <Button onClick={handleContinueToPayment}>
                  Continuar al pago
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

          {/* Step 3: Payment Method */}
          {activeStep === 3 && (
            <div className="rounded-lg border p-6">
              <h2 className="text-xl font-bold mb-4">Método de Pago</h2>

              <Tabs defaultValue="card" onValueChange={setPaymentMethod}>
                <TabsList className="grid w-full grid-cols-3 mb-6">
                  <TabsTrigger value="card">Tarjeta</TabsTrigger>
                  <TabsTrigger value="oxxo">OXXO</TabsTrigger>
                  <TabsTrigger value="transfer">Transferencia</TabsTrigger>
                </TabsList>

                <TabsContent value="card">
                  <div className="space-y-4 mb-6">
                    <div>
                      <Label htmlFor="cardNumber">Número de Tarjeta</Label>
                      <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="expiryDate">Fecha de Expiración</Label>
                        <Input id="expiryDate" placeholder="MM/AA" />
                      </div>
                      <div>
                        <Label htmlFor="cvv">CVV</Label>
                        <Input id="cvv" placeholder="123" />
                      </div>
                    </div>
                    <div>
                      <Label htmlFor="cardName">Nombre en la Tarjeta</Label>
                      <Input id="cardName" placeholder="Como aparece en la tarjeta" />
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="oxxo">
                  <div className="text-center p-6 mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-600" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">Pago en OXXO</h3>
                    <p className="text-gray-600 mb-4">
                      Al finalizar tu compra, recibirás un código de barras para realizar el pago en cualquier tienda
                      OXXO.
                    </p>
                    <p className="text-sm text-gray-500">Tu pedido se procesará una vez que confirmemos tu pago.</p>
                  </div>
                </TabsContent>

                <TabsContent value="transfer">
                  <div className="text-center p-6 mb-6">
                    <div className="bg-gray-100 p-4 rounded-lg inline-block mb-4">
                      <CreditCard className="h-12 w-12 mx-auto text-gray-600" />
                    </div>
                    <h3 className="font-medium text-lg mb-2">Transferencia Bancaria</h3>
                    <p className="text-gray-600 mb-4">
                      Al finalizar tu compra, recibirás los datos bancarios para realizar la transferencia.
                    </p>
                    <p className="text-sm text-gray-500">Tu pedido se procesará una vez que confirmemos tu pago.</p>
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex justify-between">
                <Button variant="outline" onClick={() => setActiveStep(2)}>
                  Volver
                </Button>
                <Button onClick={handlePlaceOrder} disabled={isProcessing}>
                  {isProcessing ? (
                    <>Procesando...</>
                  ) : (
                    <>
                      Realizar Pedido
                      <Check className="ml-2 h-4 w-4" />
                    </>
                  )}
                </Button>
              </div>
            </div>
          )}
        </div>

        <div className="lg:col-span-1">
          <div className="rounded-lg border p-6 sticky top-24">
            <h2 className="text-lg font-bold mb-4">Resumen del Pedido</h2>

            <div className="max-h-80 overflow-y-auto mb-4">
              {items.map((item) => (
                <div key={`${item.id}-${item.variant}`} className="flex items-center gap-3 py-3 border-b">
                  <div className="relative">
                    <img
                      src={item.image || "/placeholder.svg"}
                      alt={item.name}
                      className="w-16 h-16 object-cover rounded-md"
                    />
                    <span className="absolute -top-2 -right-2 bg-gray-800 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                      {item.quantity}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-sm">{item.name}</h3>
                    {item.variantName && <p className="text-xs text-gray-600">{item.variantName}</p>}
                  </div>
                  <div className="font-medium">${(item.price * item.quantity).toLocaleString("es-MX")}</div>
                </div>
              ))}
            </div>

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

            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>${total.toLocaleString("es-MX")}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CheckoutPage

