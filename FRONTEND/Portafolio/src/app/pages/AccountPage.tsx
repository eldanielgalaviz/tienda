"use client"

import { useState } from "react"
import { useRouter } from "next/navigation";
import { User, Package, Heart, CreditCard, LogOut, Settings, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

const mockOrders = [
  {
    id: "ORD-001",
    date: "2023-05-15",
    status: "completed",
    total: 3999,  
    items: [{ name: "Air Jordan 1 High OG", variant: "Talla 8", quantity: 1, price: 3999 }],
  },
  {
    id: "ORD-002",
    date: "2023-06-20",
    status: "processing",
    total: 2499,
    items: [{ name: "Nike Dunk Low Green", variant: "Talla 9", quantity: 1, price: 2499 }],
  },
  {
    id: "ORD-003",
    date: "2023-07-05",
    status: "completed",
    total: 4598,
    items: [
      { name: "Adidas Superstar", variant: "Talla 8", quantity: 1, price: 1999 },
      { name: "Hoodie Oversize", variant: "Talla M", quantity: 1, price: 899 },
      { name: "Gorra Snapback", variant: "Talla Única", quantity: 1, price: 499 },
      { name: "Mochila Urbana", variant: "Talla Única", quantity: 1, price: 799 },
    ],
  },
]

const mockWishlist = [
  {
    id: "1",
    name: "Air Jordan 1 Mid SE",
    price: 2799,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "2",
    name: "Nike Air Force 1",
    price: 2299,
    image: "/placeholder.svg?height=100&width=100",
  },
  {
    id: "3",
    name: "Adidas Forum Low",
    price: 2199,
    image: "/placeholder.svg?height=100&width=100",
  },
]

const mockAddresses = [
  {
    id: "1",
    name: "Casa",
    address: "Calle Principal 123",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "01000",
    isDefault: true,
  },
  {
    id: "2",
    name: "Oficina",
    address: "Av. Reforma 456",
    city: "Ciudad de México",
    state: "CDMX",
    postalCode: "06500",
    isDefault: false,
  },
]

const AccountPage = () => {
  const [activeTab, setActiveTab] = useState("profile")
  const { toast } = useToast()
    const router = useRouter() 

  const handleLogout = () => {
    toast({
      title: "Sesión cerrada",
      description: "Has cerrado sesión correctamente.",
    })
    router.push("/login")
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge variant="default">Completado</Badge>
      case "processing":
        return <Badge variant="outline">Procesando</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  return (
    <div className="container mx-auto px-4 py-24">
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-64">
          <div className="sticky top-24">
            <div className="flex items-center gap-3 mb-6">
              <Avatar className="h-12 w-12">
                <AvatarImage src="/placeholder-user.jpg" alt="Usuario" />
                <AvatarFallback>JD</AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-bold">Juan Pérez</h2>
                <p className="text-sm text-gray-600">usuario@ejemplo.com</p>
              </div>
            </div>

            <Tabs orientation="vertical" value={activeTab} onValueChange={setActiveTab} className="w-full">
              <TabsList className="flex flex-col h-auto bg-transparent p-0 w-full">
                <TabsTrigger
                  value="profile"
                  className="justify-start gap-2 px-3 py-2 h-auto data-[state=active]:bg-muted"
                >
                  <User className="h-4 w-4" />
                  Mi Perfil
                </TabsTrigger>
                <TabsTrigger
                  value="orders"
                  className="justify-start gap-2 px-3 py-2 h-auto data-[state=active]:bg-muted"
                >
                  <Package className="h-4 w-4" />
                  Mis Pedidos
                </TabsTrigger>
                <TabsTrigger
                  value="wishlist"
                  className="justify-start gap-2 px-3 py-2 h-auto data-[state=active]:bg-muted"
                >
                  <Heart className="h-4 w-4" />
                  Lista de Deseos
                </TabsTrigger>
                <TabsTrigger
                  value="addresses"
                  className="justify-start gap-2 px-3 py-2 h-auto data-[state=active]:bg-muted"
                >
                  <CreditCard className="h-4 w-4" />
                  Direcciones
                </TabsTrigger>
                <TabsTrigger
                  value="settings"
                  className="justify-start gap-2 px-3 py-2 h-auto data-[state=active]:bg-muted"
                >
                  <Settings className="h-4 w-4" />
                  Configuración
                </TabsTrigger>
              </TabsList>
            </Tabs>

            <Button variant="outline" className="w-full mt-6 gap-2" onClick={handleLogout}>
              <LogOut className="h-4 w-4" />
              Cerrar Sesión
            </Button>
          </div>
        </div>

        <div className="flex-1">
          <TabsContent value="profile" className="mt-0">
            <h1 className="text-2xl font-bold mb-6">Mi Perfil</h1>

            <Card>
              <CardHeader>
                <CardTitle>Información Personal</CardTitle>
                <CardDescription>Actualiza tu información personal y de contacto.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium">Nombre</label>
                    <p>Juan</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Apellidos</label>
                    <p>Pérez</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Correo Electrónico</label>
                    <p>usuario@ejemplo.com</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Teléfono</label>
                    <p>+52 55 1234 5678</p>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Editar Perfil</Button>
              </CardFooter>
            </Card>
          </TabsContent>

          <TabsContent value="orders" className="mt-0">
            <h1 className="text-2xl font-bold mb-6">Mis Pedidos</h1>

            <div className="space-y-6">
              {mockOrders.map((order) => (
                <Card key={order.id}>
                  <CardHeader className="pb-3">
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                      <div>
                        <CardTitle className="text-lg">Pedido #{order.id}</CardTitle>
                        <CardDescription>Fecha: {new Date(order.date).toLocaleDateString()}</CardDescription>
                      </div>
                      <div className="flex items-center gap-3">
                        {getStatusBadge(order.status)}
                        <span className="font-bold">${order.total.toLocaleString("es-MX")}</span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {order.items.map((item, index) => (
                        <div key={index} className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{item.name}</p>
                            <p className="text-sm text-gray-600">
                              {item.variant} x {item.quantity}
                            </p>
                          </div>
                          <p className="font-medium">${item.price.toLocaleString("es-MX")}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                  <CardFooter>
                    <Button variant="outline" className="w-full sm:w-auto">
                      Ver Detalles
                      <ChevronRight className="ml-2 h-4 w-4" />
                    </Button>
                  </CardFooter>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="wishlist" className="mt-0">
            <h1 className="text-2xl font-bold mb-6">Lista de Deseos</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {mockWishlist.map((item) => (
                <Card key={item.id}>
                  <CardContent className="p-4">
                    <div className="flex gap-4">
                      <img
                        src={item.image || "/placeholder.svg"}
                        alt={item.name}
                        className="w-20 h-20 object-cover rounded-md"
                      />
                      <div className="flex-1">
                        <h3 className="font-medium">{item.name}</h3>
                        <p className="font-bold">${item.price.toLocaleString("es-MX")}</p>
                        <div className="flex gap-2 mt-2">
                          <Button size="sm" variant="outline">
                            Ver Producto
                          </Button>
                          <Button size="sm">Añadir al Carrito</Button>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="addresses" className="mt-0">
            <h1 className="text-2xl font-bold mb-6">Mis Direcciones</h1>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              {mockAddresses.map((address) => (
                <Card key={address.id}>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <CardTitle className="text-lg">{address.name}</CardTitle>
                      {address.isDefault && <Badge variant="outline">Predeterminada</Badge>}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p>{address.address}</p>
                    <p>
                      {address.city}, {address.state}
                    </p>
                    <p>CP: {address.postalCode}</p>
                  </CardContent>
                  <CardFooter className="flex justify-between">
                    <Button variant="outline" size="sm">
                      Editar
                    </Button>
                    {!address.isDefault && (
                      <Button variant="outline" size="sm">
                        Eliminar
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>

            <Button>Añadir Nueva Dirección</Button>
          </TabsContent>

          <TabsContent value="settings" className="mt-0">
            <h1 className="text-2xl font-bold mb-6">Configuración</h1>

            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Cambiar Contraseña</CardTitle>
                <CardDescription>Actualiza tu contraseña para mantener tu cuenta segura.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Contraseña Actual</label>
                  <input type="password" className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium">Nueva Contraseña</label>
                  <input type="password" className="w-full mt-1 p-2 border rounded-md" />
                </div>
                <div>
                  <label className="text-sm font-medium">Confirmar Nueva Contraseña</label>
                  <input type="password" className="w-full mt-1 p-2 border rounded-md" />
                </div>
              </CardContent>
              <CardFooter>
                <Button>Actualizar Contraseña</Button>
              </CardFooter>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Preferencias de Notificaciones</CardTitle>
                <CardDescription>Configura cómo quieres recibir notificaciones.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Correos de Ofertas</p>
                    <p className="text-sm text-gray-600">Recibe ofertas y promociones especiales</p>
                  </div>
                  <div className="h-6 w-11 bg-gray-200 rounded-full relative">
                    <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 left-0.5 shadow"></div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Actualizaciones de Pedidos</p>
                    <p className="text-sm text-gray-600">Recibe notificaciones sobre tus pedidos</p>
                  </div>
                  <div className="h-6 w-11 bg-black rounded-full relative">
                    <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                  </div>
                </div>
                <Separator />
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Nuevos Lanzamientos</p>
                    <p className="text-sm text-gray-600">Recibe notificaciones sobre nuevos productos</p>
                  </div>
                  <div className="h-6 w-11 bg-black rounded-full relative">
                    <div className="h-5 w-5 bg-white rounded-full absolute top-0.5 right-0.5 shadow"></div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button>Guardar Preferencias</Button>
              </CardFooter>
            </Card>
          </TabsContent>
        </div>
      </div>
    </div>
  )
}

export default AccountPage

