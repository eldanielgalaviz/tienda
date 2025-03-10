"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, ArrowUpDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/components/ui/use-toast" // Asegúrate de tener este componente

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const { toast } = useToast()

  // Fetch orders from API
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true)
        const url = statusFilter !== "all" 
          ? `/api/orders?status=${statusFilter}`
          : '/api/orders'
          
        const response = await fetch(url)
        if (!response.ok) {
          throw new Error('Error al cargar pedidos')
        }
        const data = await response.json()
        setOrders(data.orders)
      } catch (error) {
        console.error('Error fetching orders:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los pedidos",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchOrders()
  }, [statusFilter])

  const handleViewOrder = async (order) => {
    try {
      setSelectedOrder(order)
      setIsViewOrderOpen(true)
      setIsLoadingDetail(true)
      
      // Usamos el id real del pedido, no el número de pedido que se muestra
      const response = await fetch(`/api/orders?id=${order.orderId || order.id}`)
      if (!response.ok) {
        throw new Error('Error al cargar los detalles del pedido')
      }
      
      const data = await response.json()
      setOrderDetail(data.order)
    } catch (error) {
      console.error('Error fetching order details:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del pedido",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  const handleStatusChange = (value) => {
    setStatusFilter(value)
  }

  const getStatusBadge = (status, color) => {
    // Si tenemos un color personalizado de la BD, lo usamos
    if (color) {
      return <Badge style={{backgroundColor: color}}>{getStatusLabel(status)}</Badge>
    }
    
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completado</Badge>
      case "processing":
        return <Badge variant="outline">Procesando</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">{getStatusLabel(status)}</Badge>
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case "completed":
        return "Completado"
      case "processing":
        return "Procesando"
      case "cancelled":
        return "Cancelado"
      case "pending":
        return "Pendiente"
      default:
        // Convertir primera letra a mayúscula
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getPaymentMethod = (method) => {
    switch (method) {
      case "card":
        return "Tarjeta"
      case "oxxo":
        return "OXXO"
      case "transfer":
        return "Transferencia"
      default:
        return method || "Desconocido"
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('es-MX')
  }

  // Formatear precio
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString("es-MX", {minimumFractionDigits: 2})
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar pedidos..." className="pl-8" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <Select value={statusFilter} onValueChange={handleStatusChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
              <SelectItem value="pending">Pendientes</SelectItem>
              <SelectItem value="cancelled">Cancelados</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  ID
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Fecha
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Cliente</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Total
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead>Método de Pago</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando pedidos...
                  </div>
                </TableCell>
              </TableRow>
            ) : orders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  No hay pedidos disponibles.
                </TableCell>
              </TableRow>
            ) : (
              orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>${formatPrice(order.total)}</TableCell>
                  <TableCell>{getStatusBadge(order.status, order.statusColor)}</TableCell>
                  <TableCell>{getPaymentMethod(order.paymentMethod)}</TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem>Actualizar Estado</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">Cancelar Pedido</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-muted-foreground">
          Mostrando <strong>1</strong> a <strong>{orders.length}</strong> de <strong>{orders.length}</strong> resultados
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm" disabled>
            Anterior
          </Button>
          <Button variant="outline" size="sm" disabled>
            Siguiente
          </Button>
        </div>
      </div>

      {/* View Order Dialog */}
      <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              Detalles del Pedido #{selectedOrder?.id}
            </DialogTitle>
            <DialogDescription>
              {selectedOrder && formatDate(selectedOrder.date)}
            </DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando detalles...</span>
            </div>
          ) : orderDetail ? (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Cliente</h3>
                  <p>{orderDetail.customer}</p>
                  <p className="text-sm text-muted-foreground">{orderDetail.email}</p>
                  {orderDetail.phone && <p className="text-sm text-muted-foreground">{orderDetail.phone}</p>}
                </div>
                <div>
                  <h3 className="font-medium text-sm">Estado</h3>
                  <div className="mt-1">
                    {getStatusBadge(orderDetail.status, orderDetail.statusColor)}
                  </div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Método de Pago</h3>
                  <p>{getPaymentMethod(orderDetail.paymentMethod)}</p>
                  <p className="text-sm text-muted-foreground">
                    Estado: {orderDetail.paymentStatus || "Pendiente"}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total</h3>
                  <p className="font-bold">${formatPrice(orderDetail.total)}</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Productos</h3>
                <div className="border rounded-md">
                  <div className="p-3 border-b bg-muted/50">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-6 font-medium text-sm">Producto</div>
                      <div className="col-span-2 font-medium text-sm">Precio</div>
                      <div className="col-span-2 font-medium text-sm">Cantidad</div>
                      <div className="col-span-2 font-medium text-sm text-right">Subtotal</div>
                    </div>
                  </div>
                  {orderDetail.items && orderDetail.items.map(item => (
                    <div className="p-3 border-b" key={item.id}>
                      <div className="grid grid-cols-12 gap-2 items-center">
                        <div className="col-span-6">
                          <p className="font-medium">{item.productName}</p>
                          {item.variantDetails && (
                            <p className="text-sm text-muted-foreground">{item.variantDetails}</p>
                          )}
                        </div>
                        <div className="col-span-2">${formatPrice(item.price)}</div>
                        <div className="col-span-2">{item.quantity}</div>
                        <div className="col-span-2 text-right font-medium">
                          ${formatPrice(item.total)}
                        </div>
                      </div>
                    </div>
                  ))}
                  
                  {/* Resumen del pedido */}
                  <div className="p-3 border-t">
                    <div className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-8 text-right">Subtotal:</div>
                      <div className="col-span-4 text-right">${formatPrice(orderDetail.subtotal)}</div>
                    </div>
                    {orderDetail.shipping > 0 && (
                      <div className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-8 text-right">Envío:</div>
                        <div className="col-span-4 text-right">${formatPrice(orderDetail.shipping)}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-12 gap-2 text-sm">
                      <div className="col-span-8 text-right">Impuestos:</div>
                      <div className="col-span-4 text-right">${formatPrice(orderDetail.tax)}</div>
                    </div>
                    {orderDetail.discount > 0 && (
                      <div className="grid grid-cols-12 gap-2 text-sm">
                        <div className="col-span-8 text-right">Descuento:</div>
                        <div className="col-span-4 text-right">-${formatPrice(orderDetail.discount)}</div>
                      </div>
                    )}
                    <div className="grid grid-cols-12 gap-2 mt-2 font-bold">
                      <div className="col-span-8 text-right">Total:</div>
                      <div className="col-span-4 text-right">${formatPrice(orderDetail.total)}</div>
                    </div>
                  </div>
                </div>
              </div>

              {orderDetail.shippingAddress && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Dirección de Envío</h3>
                  <div className="border rounded-md p-3">
                    <p>{orderDetail.customer}</p>
                    <p>{orderDetail.shippingAddress.address_line1}</p>
                    {orderDetail.shippingAddress.address_line2 && (
                      <p>{orderDetail.shippingAddress.address_line2}</p>
                    )}
                    <p>
                      {orderDetail.shippingAddress.city}, {orderDetail.shippingAddress.state}
                    </p>
                    <p>CP: {orderDetail.shippingAddress.postal_code}</p>
                    <p>{orderDetail.shippingAddress.country}</p>
                  </div>
                </div>
              )}

              {orderDetail.trackingNumber && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Información de Envío</h3>
                  <div className="border rounded-md p-3">
                    <p><span className="font-medium">Método:</span> {orderDetail.shippingMethod}</p>
                    <p><span className="font-medium">Número de Seguimiento:</span> {orderDetail.trackingNumber}</p>
                  </div>
                </div>
              )}

              {orderDetail.notes && (
                <div>
                  <h3 className="font-medium text-sm mb-2">Notas</h3>
                  <div className="border rounded-md p-3">
                    <p>{orderDetail.notes}</p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No se pudieron cargar los detalles del pedido
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewOrderOpen(false)}>
              Cerrar
            </Button>
            <Button>Imprimir Pedido</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders