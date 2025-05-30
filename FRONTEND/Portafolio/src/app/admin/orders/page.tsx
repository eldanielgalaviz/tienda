"use client"

import { useState, useEffect } from "react"
import { 
  Search, Filter, MoreHorizontal, ArrowUpDown, Loader2, RefreshCw, Eye 
} from "lucide-react"
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/components/ui/use-toast"

const AdminOrders = () => {
  const [orders, setOrders] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState(null)
  const [orderDetail, setOrderDetail] = useState(null)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const [statusFilter, setStatusFilter] = useState("all")
  const [searchTerm, setSearchTerm] = useState("")
  const [orderStatistics, setOrderStatistics] = useState({
    total: 0,
    completed: 0,
    processing: 0,
    cancelled: 0,
    totalSales: 0
  })
  
  const { toast } = useToast()

  // Fetch orders from API
  const fetchOrders = async (showLoading = true) => {
    try {
      if (showLoading) setIsLoading(true)
      else setIsRefreshing(true)
      
      const url = statusFilter !== "all" 
        ? `/api/orders?status=${statusFilter}`
        : '/api/orders'
        
      console.log("Fetching orders from:", url);
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error('Error al cargar pedidos')
      }
      const data = await response.json()
      console.log("Orders data received:", data);
      
      if (!data.orders) {
        console.warn("No orders array in response", data);
        toast({
          title: "Error",
          description: "Formato de respuesta incorrecto",
          variant: "destructive",
        });
        return;
      }
      
      // Ordenar más recientes primero
      const sortedOrders = [...data.orders].sort((a, b) => {
        return new Date(b.date) - new Date(a.date)
      })
      
      setOrders(sortedOrders)
      console.log("Sorted orders:", sortedOrders);
      
      // Calcular estadísticas
      calculateStatistics(sortedOrders)
    } catch (error) {
      console.error('Error fetching orders:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los pedidos: " + error.message,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setIsRefreshing(false)
    }
  }

  // Calculate order statistics
  const calculateStatistics = (ordersData) => {
    if (!ordersData || ordersData.length === 0) {
      setOrderStatistics({
        total: 0,
        completed: 0,
        processing: 0,
        cancelled: 0,
        totalSales: 0
      })
      return
    }

    const statistics = {
      total: ordersData.length,
      completed: 0,
      processing: 0,
      cancelled: 0,
      totalSales: 0
    }

    ordersData.forEach(order => {
      // Sumar todas las ventas
      statistics.totalSales += parseFloat(order.total) || 0

      // Contar por estado
      const status = (order.status || '').toLowerCase();
      if (status.includes('complet') || status.includes('entregad')) {
        statistics.completed += 1
      } else if (status.includes('cancel')) {
        statistics.cancelled += 1
      } else {
        statistics.processing += 1
      }
    })

    setOrderStatistics(statistics)
  }

  // Load orders on component mount and when filter changes
  useEffect(() => {
    fetchOrders()
    
    // Recargar automáticamente cada 30 segundos
    const interval = setInterval(() => {
      fetchOrders(false)
    }, 30000)
    
    return () => clearInterval(interval)
  }, [statusFilter])

  // Handle view order details
// Parte del componente AdminOrders - Función handleViewOrder mejorada

const handleViewOrder = async (order) => {
  try {
    setSelectedOrder(order);
    setIsViewOrderOpen(true);
    setIsLoadingDetail(true);
    
    // Usar el ID real del pedido (UUID), no el número de pedido
    const orderIdToUse = order.orderId;
    
    console.log("Obteniendo detalles para pedido:", {
      id: order.id,
      orderId: orderIdToUse
    });
    
    if (!orderIdToUse) {
      throw new Error('ID de pedido no disponible');
    }
    
    const response = await fetch(`/api/orders?id=${orderIdToUse}`);
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Error al cargar detalles del pedido');
    }
    
    const data = await response.json();
    
    if (!data.order) {
      throw new Error('Formato de respuesta inválido');
    }
    
    setOrderDetail(data.order);
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    toast({
      title: "Error",
      description: error.message || "No se pudieron cargar los detalles del pedido",
      variant: "destructive",
    });
  } finally {
    setIsLoadingDetail(false);
  }
};

  // Handle status change
  const handleStatusChange = (value) => {
    setStatusFilter(value)
  }

  // Handle search
  const handleSearch = (e) => {
    setSearchTerm(e.target.value)
  }

  // Filtered orders based on search term
  const filteredOrders = orders.filter(order => {
    if (!searchTerm) return true
    
    const searchLower = searchTerm.toLowerCase()
    
    // Busca en ID, cliente y email
    return (
      (order.id || '').toLowerCase().includes(searchLower) ||
      (order.customer || '').toLowerCase().includes(searchLower) ||
      (order.email || '').toLowerCase().includes(searchLower)
    )
  })

  // Helper functions for UI
  const getStatusBadge = (status, color) => {
    if (!status) return <Badge variant="outline">Pendiente</Badge>;
    
    // Si tenemos un color personalizado de la BD, lo usamos
    if (color) {
      return <Badge style={{backgroundColor: color}}>{getStatusLabel(status)}</Badge>
    }
    
    // Status fallbacks
    const statusLower = status.toLowerCase()
    
    if (statusLower.includes('complet') || statusLower.includes('entreg')) {
      return <Badge className="bg-green-500">{getStatusLabel(status)}</Badge>
    } else if (statusLower.includes('cancel')) {
      return <Badge variant="destructive">{getStatusLabel(status)}</Badge>
    } else if (statusLower.includes('proces') || statusLower.includes('pendi')) {
      return <Badge variant="outline" className="bg-amber-100 text-amber-800">{getStatusLabel(status)}</Badge>
    } else if (statusLower.includes('envi')) {
      return <Badge className="bg-blue-500">{getStatusLabel(status)}</Badge>
    } else {
      return <Badge variant="outline">{getStatusLabel(status)}</Badge>
    }
  }

  const getStatusLabel = (status) => {
    if (!status) return "Pendiente";
    
    // Status fallbacks
    switch (status.toLowerCase()) {
      case "completed":
      case "completado":
        return "Completado"
      case "processing":
      case "procesando":
        return "Procesando"
      case "cancelled":
      case "cancelado":
        return "Cancelado"
      case "pending":
      case "pendiente":
        return "Pendiente"
      case "shipped":
      case "enviado":
        return "Enviado"
      case "delivered":
      case "entregado":
        return "Entregado"
      default:
        // Convertir primera letra a mayúscula
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  const getPaymentMethod = (method) => {
    if (!method) return "No especificado";
    
    switch (method.toLowerCase()) {
      case "card":
      case "tarjeta":
        return "Tarjeta"
      case "oxxo":
        return "OXXO"
      case "transfer":
      case "transferencia":
        return "Transferencia"
      case "stripe":
        return "Stripe"
      case "mercado pago":
      case "mercadopago":
        return "Mercado Pago"
      case "paypal":
        return "PayPal"
      default:
        return method
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    const date = new Date(dateString)
    return date.toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  // Formatear precio
  const formatPrice = (price) => {
    if (price === undefined || price === null) return "$0.00"
    return parseFloat(price).toLocaleString("es-MX", {
      style: 'currency',
      currency: 'MXN'
    })
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Pedidos</h1>
        
        <Button 
          onClick={() => fetchOrders(false)} 
          variant="outline" 
          size="sm"
          disabled={isRefreshing}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
          Actualizar
        </Button>
      </div>

      {/* Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total de Pedidos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orderStatistics.total}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos Completados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{orderStatistics.completed}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pedidos en Proceso</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">{orderStatistics.processing}</div>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{formatPrice(orderStatistics.totalSales)}</div>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input 
              placeholder="Buscar pedidos..." 
              className="pl-8" 
              value={searchTerm}
              onChange={handleSearch}
            />
          </div>
        </div>
        <div className="flex items-center gap-2">
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
              <SelectItem value="shipped">Enviados</SelectItem>
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
                    <span>Cargando pedidos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : filteredOrders.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="h-24 text-center">
                  <p className="text-muted-foreground">No hay pedidos disponibles.</p>
                </TableCell>
              </TableRow>
            ) : (
              filteredOrders.map((order) => (
                <TableRow key={order.id || order.orderId} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewOrder(order)}>
                  <TableCell className="font-medium">{order.id}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>
                    <div>
                      <p>{order.customer}</p>
                      <p className="text-sm text-muted-foreground">{order.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>{formatPrice(order.total)}</TableCell>
                  <TableCell>{getStatusBadge(order.status, order.statusColor)}</TableCell>
                  <TableCell>{getPaymentMethod(order.paymentMethod)}</TableCell>
                  <TableCell onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                          <span className="sr-only">Acciones</span>
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Acciones</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => handleViewOrder(order)}>
                          <Eye className="h-4 w-4 mr-2" />
                          Ver Detalles
                        </DropdownMenuItem>
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
          Mostrando <strong>{filteredOrders.length}</strong> de <strong>{orders.length}</strong> pedidos
        </div>
      </div>

      {/* Order Detail Dialog */}
      <Dialog open={isViewOrderOpen} onOpenChange={setIsViewOrderOpen}>
        <DialogContent className="sm:max-w-[800px]">
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
            <div className="space-y-6">
              {/* Header y estado */}
              <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4 pb-4 border-b">
                <div>
                  <h2 className="text-xl font-bold flex items-center gap-2">
                    Pedido #{orderDetail.id}
                    {getStatusBadge(orderDetail.status, orderDetail.statusColor)}
                  </h2>
                  <p className="text-sm text-muted-foreground">
                    Realizado el {formatDate(orderDetail.date)}
                  </p>
                </div>
              </div>
              
              {/* Detalles del cliente */}
              <div>
                <h3 className="font-medium mb-2">Cliente</h3>
                <div className="border rounded-lg p-4">
                  <p><strong>Nombre:</strong> {orderDetail.customer}</p>
                  <p><strong>Email:</strong> {orderDetail.email}</p>
                  {orderDetail.phone && <p><strong>Teléfono:</strong> {orderDetail.phone}</p>}
                </div>
              </div>
              
              {/* Detalles de pago */}
              <div>
                <h3 className="font-medium mb-2">Detalles del Pago</h3>
                <div className="border rounded-lg p-4">
                  <p><strong>Método:</strong> {getPaymentMethod(orderDetail.paymentMethod)}</p>
                  <p><strong>Estado:</strong> {orderDetail.paymentStatus || "Pendiente"}</p>
                  <div className="mt-2 pt-2 border-t">
                    <div className="flex justify-between">
                      <span>Subtotal:</span>
                      <span>{formatPrice(orderDetail.subtotal)}</span>
                    </div>
                    {orderDetail.shipping > 0 && (
                      <div className="flex justify-between">
                        <span>Envío:</span>
                        <span>{formatPrice(orderDetail.shipping)}</span>
                      </div>
                    )}
                    <div className="flex justify-between">
                      <span>Impuestos:</span>
                      <span>{formatPrice(orderDetail.tax)}</span>
                    </div>
                    {orderDetail.discount > 0 && (
                      <div className="flex justify-between">
                        <span>Descuento:</span>
                        <span>-{formatPrice(orderDetail.discount)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-bold mt-2">
                      <span>Total:</span>
                      <span>{formatPrice(orderDetail.total)}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Productos */}
              <div>
                <h3 className="font-medium mb-2">Productos</h3>
                <div className="border rounded-lg overflow-hidden">
                  <div className="bg-muted/50 p-3 grid grid-cols-12 gap-2 font-medium">
                    <div className="col-span-6">Producto</div>
                    <div className="col-span-2">Precio</div>
                    <div className="col-span-2">Cantidad</div>
                    <div className="col-span-2 text-right">Total</div>
                  </div>
                  
                  {orderDetail.items && orderDetail.items.length > 0 ? (
                    <div>
                      {orderDetail.items.map((item, index) => (
                        <div key={item.id || index} className="p-3 border-t grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-6 flex items-center">
                            {item.image && (
                              <div className="h-10 w-10 bg-gray-100 mr-3 rounded overflow-hidden">
                                <img 
                                  src={item.image} 
                                  alt={item.productName} 
                                  className="h-full w-full object-cover"
                                />
                              </div>
                            )}
                            <div>
                              <p className="font-medium">{item.productName}</p>
                              {item.variantDetails && (
                                <p className="text-sm text-muted-foreground">{item.variantDetails}</p>
                              )}
                            </div>
                          </div>
                          <div className="col-span-2">{formatPrice(item.price)}</div>
                          <div className="col-span-2">{item.quantity}</div>
                          <div className="col-span-2 text-right font-medium">{formatPrice(item.total)}</div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-4 text-center text-muted-foreground">
                      No hay productos en este pedido
                    </div>
                  )}
                </div>
              </div>
              
              {/* Dirección de envío */}
              {orderDetail.shippingAddress && (
                <div>
                  <h3 className="font-medium mb-2">Dirección de Envío</h3>
                  <div className="border rounded-lg p-4">
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
              
              {/* Notas */}
              {orderDetail.notes && (
                <div>
                  <h3 className="font-medium mb-2">Notas</h3>
                  <div className="border rounded-lg p-4">
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
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminOrders