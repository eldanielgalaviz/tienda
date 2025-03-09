"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"

const AdminSettings = () => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)

  const handleSave = () => {
    setIsLoading(true)

    // Simulación de guardado
    setTimeout(() => {
      setIsLoading(false)

      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados correctamente.",
      })
    }, 1500)
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-6">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="shipping">Envíos</TabsTrigger>
          <TabsTrigger value="payment">Pagos</TabsTrigger>
          <TabsTrigger value="notifications">Notificaciones</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Información de la Tienda</CardTitle>
              <CardDescription>Configura la información básica de tu tienda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="store-name">Nombre de la Tienda</Label>
                  <Input id="store-name" defaultValue="Fashion Treats" />
                </div>
                <div>
                  <Label htmlFor="store-email">Email de Contacto</Label>
                  <Input id="store-email" defaultValue="info@fashiontreats.mx" />
                </div>
                <div>
                  <Label htmlFor="store-phone">Teléfono</Label>
                  <Input id="store-phone" defaultValue="+52 55 1234 5678" />
                </div>
                <div>
                  <Label htmlFor="store-currency">Moneda</Label>
                  <Input id="store-currency" defaultValue="MXN" disabled />
                </div>
              </div>

              <div>
                <Label htmlFor="store-address">Dirección</Label>
                <Textarea
                  id="store-address"
                  defaultValue="Calle Principal 123, Ciudad de México, CDMX, 01000, México"
                />
              </div>

              <div>
                <Label htmlFor="store-description">Descripción de la Tienda</Label>
                <Textarea
                  id="store-description"
                  defaultValue="Fashion Treats es tu destino para moda exclusiva y sneakers de edición limitada."
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>SEO</CardTitle>
              <CardDescription>Configura los ajustes de SEO para mejorar la visibilidad de tu tienda.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="meta-title">Título de la Página</Label>
                <Input id="meta-title" defaultValue="Fashion Treats | Sneakers y Moda Exclusiva" />
              </div>
              <div>
                <Label htmlFor="meta-description">Descripción</Label>
                <Textarea
                  id="meta-description"
                  defaultValue="Fashion Treats es tu destino para sneakers de edición limitada y moda exclusiva en México. Envíos gratis a todo el país."
                />
              </div>
              <div>
                <Label htmlFor="meta-keywords">Palabras Clave</Label>
                <Input id="meta-keywords" defaultValue="sneakers, moda, ropa, accesorios, zapatillas, México" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="shipping">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Envío</CardTitle>
              <CardDescription>Configura los métodos de envío disponibles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Envío Estándar</h3>
                  <p className="text-sm text-muted-foreground">3-5 días hábiles</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="150" className="w-24" />
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Envío Express</h3>
                  <p className="text-sm text-muted-foreground">1-2 días hábiles</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="250" className="w-24" />
                  <Switch defaultChecked />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Recogida en Tienda</h3>
                  <p className="text-sm text-muted-foreground">Disponible en 24 horas</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input type="number" defaultValue="0" className="w-24" />
                  <Switch defaultChecked />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integraciones de Envío</CardTitle>
              <CardDescription>Configura las integraciones con servicios de paquetería.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Estafeta</h3>
                  <p className="text-sm text-muted-foreground">Integración con API de Estafeta</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">DHL</h3>
                  <p className="text-sm text-muted-foreground">Integración con API de DHL</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">FedEx</h3>
                  <p className="text-sm text-muted-foreground">Integración con API de FedEx</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="payment">
          <Card>
            <CardHeader>
              <CardTitle>Métodos de Pago</CardTitle>
              <CardDescription>Configura los métodos de pago disponibles.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Tarjetas de Crédito/Débito</h3>
                  <p className="text-sm text-muted-foreground">Visa, Mastercard, American Express</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">OXXO</h3>
                  <p className="text-sm text-muted-foreground">Pago en tiendas OXXO</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Transferencia Bancaria</h3>
                  <p className="text-sm text-muted-foreground">Pago por transferencia</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">PayPal</h3>
                  <p className="text-sm text-muted-foreground">Pago con PayPal</p>
                </div>
                <Switch />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Integraciones de Pago</CardTitle>
              <CardDescription>Configura las integraciones con pasarelas de pago.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="mercado-pago-key">Mercado Pago API Key</Label>
                <Input id="mercado-pago-key" type="password" defaultValue="••••••••••••••••" />
              </div>
              <div>
                <Label htmlFor="conekta-key">Conekta API Key</Label>
                <Input id="conekta-key" type="password" defaultValue="••••••••••••••••" />
              </div>
              <div>
                <Label htmlFor="stripe-key">Stripe API Key</Label>
                <Input id="stripe-key" type="password" defaultValue="" placeholder="Ingresa tu API Key de Stripe" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notificaciones por Email</CardTitle>
              <CardDescription>Configura las notificaciones automáticas por email.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Email de Bienvenida</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando un cliente se registra</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Confirmación de Pedido</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando se realiza un pedido</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Actualización de Envío</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando cambia el estado del envío</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Carrito Abandonado</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando un cliente abandona el carrito</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Newsletter</h3>
                  <p className="text-sm text-muted-foreground">Enviado periódicamente con ofertas</p>
                </div>
                <Switch defaultChecked />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Configuración de Email</CardTitle>
              <CardDescription>Configura el servidor de email para enviar notificaciones.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="smtp-host">Servidor SMTP</Label>
                <Input id="smtp-host" defaultValue="smtp.gmail.com" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtp-port">Puerto SMTP</Label>
                  <Input id="smtp-port" defaultValue="587" />
                </div>
                <div>
                  <Label htmlFor="smtp-security">Seguridad</Label>
                  <Input id="smtp-security" defaultValue="TLS" />
                </div>
              </div>
              <div>
                <Label htmlFor="smtp-user">Usuario SMTP</Label>
                <Input id="smtp-user" defaultValue="info@fashiontreats.mx" />
              </div>
              <div>
                <Label htmlFor="smtp-password">Contraseña SMTP</Label>
                <Input id="smtp-password" type="password" defaultValue="••••••••••••••••" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>

        <TabsContent value="users">
          <Card>
            <CardHeader>
              <CardTitle>Roles y Permisos</CardTitle>
              <CardDescription>Configura los roles y permisos para los usuarios del sistema.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Administrador</h3>
                  <p className="text-sm text-muted-foreground">Acceso completo a todas las funciones</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar Permisos
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Gerente</h3>
                  <p className="text-sm text-muted-foreground">Acceso a pedidos, productos y clientes</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar Permisos
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Vendedor</h3>
                  <p className="text-sm text-muted-foreground">Acceso a pedidos y clientes</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar Permisos
                </Button>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Cliente</h3>
                  <p className="text-sm text-muted-foreground">Acceso a su cuenta y pedidos</p>
                </div>
                <Button variant="outline" size="sm">
                  Editar Permisos
                </Button>
              </div>
            </CardContent>
            <CardFooter>
              <Button>Añadir Nuevo Rol</Button>
            </CardFooter>
          </Card>

          <Card className="mt-6">
            <CardHeader>
              <CardTitle>Seguridad</CardTitle>
              <CardDescription>Configura los ajustes de seguridad para los usuarios.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Autenticación de Dos Factores</h3>
                  <p className="text-sm text-muted-foreground">Requiere verificación adicional al iniciar sesión</p>
                </div>
                <Switch />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Bloqueo de Cuenta</h3>
                  <p className="text-sm text-muted-foreground">Bloquea la cuenta después de varios intentos fallidos</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Política de Contraseñas</h3>
                  <p className="text-sm text-muted-foreground">Requiere contraseñas seguras</p>
                </div>
                <Switch defaultChecked />
              </div>
              <Separator />
              <div>
                <Label htmlFor="session-timeout">Tiempo de Sesión (minutos)</Label>
                <Input id="session-timeout" type="number" defaultValue="60" />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? "Guardando..." : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminSettings

