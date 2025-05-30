// src/app/admin/settings/page.tsx
"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/components/ui/use-toast"
import { Loader2 } from "lucide-react"

const AdminSettings = () => {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingSettings, setIsLoadingSettings] = useState(true)
  const [activeTab, setActiveTab] = useState("general")
  const [settings, setSettings] = useState({
    general: {
      storeName: "Fashion Treats",
      storeEmail: "info@fashiontreats.mx",
      storePhone: "+52 55 1234 5678",
      storeCurrency: "MXN",
      storeAddress: "Calle Principal 123, Ciudad de México, CDMX, 01000, México",
      storeDescription: "Fashion Treats es tu destino para moda exclusiva y sneakers de edición limitada."
    },
    seo: {
      metaTitle: "Fashion Treats | Sneakers y Moda Exclusiva",
      metaDescription: "Fashion Treats es tu destino para sneakers de edición limitada y moda exclusiva en México. Envíos gratis a todo el país.",
      metaKeywords: "sneakers, moda, ropa, accesorios, zapatillas, México"
    },
    shipping: {
      standardShipping: {
        price: 150,
        enabled: true
      },
      expressShipping: {
        price: 250,
        enabled: true
      },
      storePickup: {
        price: 0,
        enabled: true
      },
      integrations: {
        estafeta: true,
        dhl: false,
        fedex: false
      }
    },
    payment: {
      methods: {
        cards: true,
        oxxo: true,
        transfer: true,
        paypal: false
      },
      mercadoPagoKey: "••••••••••••••••",
      conektaKey: "••••••••••••••••",
      stripeKey: "••••••••••••••••"
    },
    notifications: {
      welcome: true,
      orderConfirmation: true,
      shippingUpdate: true,
      abandonedCart: true,
      newsletter: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpSecurity: "TLS",
      smtpUser: "info@fashiontreats.mx",
      smtpPassword: "••••••••••••••••"
    },
    users: {
      sessionTimeout: 60,
      security: {
        twoFactor: false,
        accountLock: true,
        passwordPolicy: true
      }
    }
  })

  // Cargar configuraciones desde la API al iniciar
  useEffect(() => {
    const fetchSettings = async () => {
      try {
        setIsLoadingSettings(true)
        const response = await fetch('/api/settings')
        
        if (!response.ok) {
          throw new Error('Error al cargar la configuración')
        }
        
        const data = await response.json()
        if (data.settings) {
          setSettings(data.settings)
        }
      } catch (error) {
        console.error('Error fetching settings:', error)
        toast({
          title: "Error",
          description: "No se pudo cargar la configuración",
          variant: "destructive",
        })
      } finally {
        setIsLoadingSettings(false)
      }
    }
    
    fetchSettings()
  }, [toast])

  const handleInputChange = (section, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }))
  }

  const handleNestedInputChange = (section, parent, field, value) => {
    setSettings(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [parent]: {
          ...prev[section][parent],
          [field]: value
        }
      }
    }))
  }

  const handleSave = async () => {
    setIsLoading(true)

    try {
      const response = await fetch('/api/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings })
      })
      
      if (!response.ok) {
        throw new Error('Error al guardar la configuración')
      }
      
      toast({
        title: "Configuración guardada",
        description: "Los cambios han sido guardados correctamente.",
      })
    } catch (error) {
      console.error('Error saving settings:', error)
      toast({
        title: "Error",
        description: "No se pudieron guardar los cambios",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTabChange = (value) => {
    setActiveTab(value)
  }

  if (isLoadingSettings) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="h-8 w-8 animate-spin mr-3" />
        <span className="text-lg">Cargando configuración...</span>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Configuración</h1>

      <Tabs defaultValue="general" value={activeTab} onValueChange={handleTabChange}>
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
                  <Label htmlFor="storeName">Nombre de la Tienda</Label>
                  <Input 
                    id="storeName" 
                    value={settings.general.storeName} 
                    onChange={(e) => handleInputChange('general', 'storeName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storeEmail">Email de Contacto</Label>
                  <Input 
                    id="storeEmail" 
                    value={settings.general.storeEmail} 
                    onChange={(e) => handleInputChange('general', 'storeEmail', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storePhone">Teléfono</Label>
                  <Input 
                    id="storePhone" 
                    value={settings.general.storePhone} 
                    onChange={(e) => handleInputChange('general', 'storePhone', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="storeCurrency">Moneda</Label>
                  <Input 
                    id="storeCurrency" 
                    value={settings.general.storeCurrency} 
                    disabled 
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="storeAddress">Dirección</Label>
                <Textarea
                  id="storeAddress"
                  value={settings.general.storeAddress}
                  onChange={(e) => handleInputChange('general', 'storeAddress', e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="storeDescription">Descripción de la Tienda</Label>
                <Textarea
                  id="storeDescription"
                  value={settings.general.storeDescription}
                  onChange={(e) => handleInputChange('general', 'storeDescription', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Label htmlFor="metaTitle">Título de la Página</Label>
                <Input 
                  id="metaTitle" 
                  value={settings.seo.metaTitle} 
                  onChange={(e) => handleInputChange('seo', 'metaTitle', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="metaDescription">Descripción</Label>
                <Textarea
                  id="metaDescription"
                  value={settings.seo.metaDescription}
                  onChange={(e) => handleInputChange('seo', 'metaDescription', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="metaKeywords">Palabras Clave</Label>
                <Input 
                  id="metaKeywords" 
                  value={settings.seo.metaKeywords} 
                  onChange={(e) => handleInputChange('seo', 'metaKeywords', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={settings.shipping.standardShipping.price}
                    onChange={(e) => handleNestedInputChange('shipping', 'standardShipping', 'price', parseInt(e.target.value))}
                  />
                  <Switch 
                    checked={settings.shipping.standardShipping.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange('shipping', 'standardShipping', 'enabled', checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Envío Express</h3>
                  <p className="text-sm text-muted-foreground">1-2 días hábiles</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={settings.shipping.expressShipping.price}
                    onChange={(e) => handleNestedInputChange('shipping', 'expressShipping', 'price', parseInt(e.target.value))}
                  />
                  <Switch 
                    checked={settings.shipping.expressShipping.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange('shipping', 'expressShipping', 'enabled', checked)}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Recogida en Tienda</h3>
                  <p className="text-sm text-muted-foreground">Disponible en 24 horas</p>
                </div>
                <div className="flex items-center gap-4">
                  <Input 
                    type="number" 
                    className="w-24" 
                    value={settings.shipping.storePickup.price}
                    onChange={(e) => handleNestedInputChange('shipping', 'storePickup', 'price', parseInt(e.target.value))}
                  />
                  <Switch 
                    checked={settings.shipping.storePickup.enabled}
                    onCheckedChange={(checked) => handleNestedInputChange('shipping', 'storePickup', 'enabled', checked)}
                  />
                </div>
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Switch 
                  checked={settings.shipping.integrations.estafeta}
                  onCheckedChange={(checked) => handleNestedInputChange('shipping', 'integrations', 'estafeta', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">DHL</h3>
                  <p className="text-sm text-muted-foreground">Integración con API de DHL</p>
                </div>
                <Switch 
                  checked={settings.shipping.integrations.dhl}
                  onCheckedChange={(checked) => handleNestedInputChange('shipping', 'integrations', 'dhl', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">FedEx</h3>
                  <p className="text-sm text-muted-foreground">Integración con API de FedEx</p>
                </div>
                <Switch 
                  checked={settings.shipping.integrations.fedex}
                  onCheckedChange={(checked) => handleNestedInputChange('shipping', 'integrations', 'fedex', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Switch 
                  checked={settings.payment.methods.cards}
                  onCheckedChange={(checked) => handleNestedInputChange('payment', 'methods', 'cards', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">OXXO</h3>
                  <p className="text-sm text-muted-foreground">Pago en tiendas OXXO</p>
                </div>
                <Switch 
                  checked={settings.payment.methods.oxxo}
                  onCheckedChange={(checked) => handleNestedInputChange('payment', 'methods', 'oxxo', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Transferencia Bancaria</h3>
                  <p className="text-sm text-muted-foreground">Pago por transferencia</p>
                </div>
                <Switch 
                  checked={settings.payment.methods.transfer}
                  onCheckedChange={(checked) => handleNestedInputChange('payment', 'methods', 'transfer', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">PayPal</h3>
                  <p className="text-sm text-muted-foreground">Pago con PayPal</p>
                </div>
                <Switch 
                  checked={settings.payment.methods.paypal}
                  onCheckedChange={(checked) => handleNestedInputChange('payment', 'methods', 'paypal', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Label htmlFor="mercadoPagoKey">Mercado Pago API Key</Label>
                <Input 
                  id="mercadoPagoKey" 
                  type="password" 
                  value={settings.payment.mercadoPagoKey}
                  onChange={(e) => handleInputChange('payment', 'mercadoPagoKey', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="conektaKey">Conekta API Key</Label>
                <Input 
                  id="conektaKey" 
                  type="password" 
                  value={settings.payment.conektaKey}
                  onChange={(e) => handleInputChange('payment', 'conektaKey', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="stripeKey">Stripe API Key</Label>
                <Input 
                  id="stripeKey" 
                  type="password" 
                  value={settings.payment.stripeKey}
                  onChange={(e) => handleInputChange('payment', 'stripeKey', e.target.value)}
                  placeholder="Ingresa tu API Key de Stripe" 
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Switch 
                  checked={settings.notifications.welcome}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'welcome', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Confirmación de Pedido</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando se realiza un pedido</p>
                </div>
                <Switch 
                  checked={settings.notifications.orderConfirmation}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'orderConfirmation', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Actualización de Envío</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando cambia el estado del envío</p>
                </div>
                <Switch 
                  checked={settings.notifications.shippingUpdate}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'shippingUpdate', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Carrito Abandonado</h3>
                  <p className="text-sm text-muted-foreground">Enviado cuando un cliente abandona el carrito</p>
                </div>
                <Switch 
                  checked={settings.notifications.abandonedCart}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'abandonedCart', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Newsletter</h3>
                  <p className="text-sm text-muted-foreground">Enviado periódicamente con ofertas</p>
                </div>
                <Switch 
                  checked={settings.notifications.newsletter}
                  onCheckedChange={(checked) => handleInputChange('notifications', 'newsletter', checked)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Label htmlFor="smtpHost">Servidor SMTP</Label>
                <Input 
                  id="smtpHost" 
                  value={settings.notifications.smtpHost}
                  onChange={(e) => handleInputChange('notifications', 'smtpHost', e.target.value)}
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="smtpPort">Puerto SMTP</Label>
                  <Input 
                    id="smtpPort" 
                    value={settings.notifications.smtpPort}
                    onChange={(e) => handleInputChange('notifications', 'smtpPort', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor="smtpSecurity">Seguridad</Label>
                  <Input 
                    id="smtpSecurity" 
                    value={settings.notifications.smtpSecurity}
                    onChange={(e) => handleInputChange('notifications', 'smtpSecurity', e.target.value)}
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="smtpUser">Usuario SMTP</Label>
                <Input 
                  id="smtpUser" 
                  value={settings.notifications.smtpUser}
                  onChange={(e) => handleInputChange('notifications', 'smtpUser', e.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="smtpPassword">Contraseña SMTP</Label>
                <Input 
                  id="smtpPassword" 
                  type="password" 
                  value={settings.notifications.smtpPassword}
                  onChange={(e) => handleInputChange('notifications', 'smtpPassword', e.target.value)}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
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
                <Switch 
                  checked={settings.users.security.twoFactor}
                  onCheckedChange={(checked) => handleNestedInputChange('users', 'security', 'twoFactor', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Bloqueo de Cuenta</h3>
                  <p className="text-sm text-muted-foreground">Bloquea la cuenta después de varios intentos fallidos</p>
                </div>
                <Switch 
                  checked={settings.users.security.accountLock}
                  onCheckedChange={(checked) => handleNestedInputChange('users', 'security', 'accountLock', checked)}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-medium">Política de Contraseñas</h3>
                  <p className="text-sm text-muted-foreground">Requiere contraseñas seguras</p>
                </div>
                <Switch 
                  checked={settings.users.security.passwordPolicy}
                  onCheckedChange={(checked) => handleNestedInputChange('users', 'security', 'passwordPolicy', checked)}
                />
              </div>
              <Separator />
              <div>
                <Label htmlFor="sessionTimeout">Tiempo de Sesión (minutos)</Label>
                <Input 
                  id="sessionTimeout" 
                  type="number" 
                  value={settings.users.sessionTimeout}
                  onChange={(e) => handleInputChange('users', 'sessionTimeout', parseInt(e.target.value))}
                />
              </div>
            </CardContent>
            <CardFooter>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Guardando...
                  </>
                ) : "Guardar Cambios"}
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default AdminSettings;