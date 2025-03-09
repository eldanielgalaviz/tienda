"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, ArrowUpDown } from "lucide-react"
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

const mockOrders = [
  {
    id: "ORD-001",
    date: "2023-05-15",
    customer: "Juan Pérez",
    email: "juan@ejemplo.com",
    total: 3999,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-002",
    date: "2023-06-20",
    customer: "María López",
    email: "maria@ejemplo.com",
    total: 2499,
    status: "processing",
    paymentMethod: "oxxo",
  },
  {
    id: "ORD-003",
    date: "2023-07-05",
    customer: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    total: 4598,
    status: "completed",
    paymentMethod: "card",
  },
  {
    id: "ORD-004",
    date: "2023-07-10",
    customer: "Ana Martínez",
    email: "ana@ejemplo.com",
    total: 1398,
    status: "processing",
    paymentMethod: "transfer",
  },
  {
    id: "ORD-005",
    date: "2023-07-15",
    customer: "Roberto Sánchez",
    email: "roberto@ejemplo.com",
    total: 899,
    status: "cancelled",
    paymentMethod: "card",
  },
]

const AdminOrders = () => {
  const [orders, setOrders] = useState(mockOrders)
  const [selectedOrder, setSelectedOrder] = useState<any>(null)
  const [isViewOrderOpen, setIsViewOrderOpen] = useState(false)

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "completed":
        return <Badge className="bg-green-500">Completado</Badge>
      case "processing":
        return <Badge variant="outline">Procesando</Badge>
      case "cancelled":
        return <Badge variant="destructive">Cancelado</Badge>
      default:
        return <Badge variant="outline">Pendiente</Badge>
    }
  }

  const getPaymentMethod = (method: string) => {
    switch (method) {
      case "card":
        return "Tarjeta"
      case "oxxo":
        return "OXXO"
      case "transfer":
        return "Transferencia"
      default:
        return "Desconocido"
    }
  }

  const handleViewOrder = (order: any) => {
    setSelectedOrder(order)
    setIsViewOrderOpen(true)
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
          <Select defaultValue="all">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="completed">Completados</SelectItem>
              <SelectItem value="processing">Procesando</SelectItem>
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
            {orders.map((order) => (
              <TableRow key={order.id}>
                <TableCell className="font-medium">{order.id}</TableCell>
                <TableCell>{new Date(order.date).toLocaleDateString()}</TableCell>
                <TableCell>
                  <div>
                    <p>{order.customer}</p>
                    <p className="text-sm text-muted-foreground">{order.email}</p>
                  </div>
                </TableCell>
                <TableCell>${order.total.toLocaleString("es-MX")}</TableCell>
                <TableCell>{getStatusBadge(order.status)}</TableCell>
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
            ))}
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
            <DialogTitle>Detalles del Pedido #{selectedOrder?.id}</DialogTitle>
            <DialogDescription>{selectedOrder && new Date(selectedOrder.date).toLocaleDateString()}</DialogDescription>
          </DialogHeader>

          {selectedOrder && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Cliente</h3>
                  <p>{selectedOrder.customer}</p>
                  <p className="text-sm text-muted-foreground">{selectedOrder.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Estado</h3>
                  <div className="mt-1">{getStatusBadge(selectedOrder.status)}</div>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Método de Pago</h3>
                  <p>{getPaymentMethod(selectedOrder.paymentMethod)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total</h3>
                  <p className="font-bold">${selectedOrder.total.toLocaleString("es-MX")}</p>
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
                  <div className="p-3">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-6">
                        <p className="font-medium">Air Jordan 1 High OG</p>
                        <p className="text-sm text-muted-foreground">Talla 8</p>
                      </div>
                      <div className="col-span-2">$3,999</div>
                      <div className="col-span-2">1</div>
                      <div className="col-span-2 text-right font-medium">$3,999</div>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Dirección de Envío</h3>
                <div className="border rounded-md p-3">
                  <p>Juan Pérez</p>
                  <p>Calle Principal 123</p>
                  <p>Ciudad de México, CDMX</p>
                  <p>CP: 01000</p>
                </div>
              </div>
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

