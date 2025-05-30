"use client"

import { useState, useEffect } from "react"
import { Search, Filter, MoreHorizontal, ArrowUpDown, ChevronDown, Loader2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useToast } from "@/components/ui/use-toast" // Asegúrate de tener este componente

const AdminCustomers = () => {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false)
  const [customerDetail, setCustomerDetail] = useState(null)
  const [isLoadingDetail, setIsLoadingDetail] = useState(false)
  const { toast } = useToast()

  // Fetch customers from API
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true)
        const response = await fetch('/api/customers')
        if (!response.ok) {
          throw new Error('Error al cargar clientes')
        }
        const data = await response.json()
        setCustomers(data.customers)
      } catch (error) {
        console.error('Error fetching customers:', error)
        toast({
          title: "Error",
          description: "No se pudieron cargar los clientes",
          variant: "destructive",
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchCustomers()
  }, [])

  const handleViewCustomer = async (customer) => {
    try {
      setSelectedCustomer(customer)
      setIsViewCustomerOpen(true)
      setIsLoadingDetail(true)
      
      // Usamos la misma API pero con un parámetro de consulta para obtener los detalles
      const response = await fetch(`/api/customers?id=${customer.id}`)
      if (!response.ok) {
        throw new Error('Error al cargar los detalles del cliente')
      }
      
      const data = await response.json()
      setCustomerDetail(data.customer)
    } catch (error) {
      console.error('Error fetching customer details:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del cliente",
        variant: "destructive",
      })
    } finally {
      setIsLoadingDetail(false)
    }
  }

  // Formatear fecha para mostrar
  const formatDate = (dateString) => {
    if (!dateString) return "-"
    return new Date(dateString).toLocaleDateString('es-MX')
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Clientes</h1>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar clientes..." className="pl-8" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filtrar
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" size="sm">
                Columnas
                <ChevronDown className="ml-2 h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Mostrar columnas</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuCheckboxItem checked>Nombre</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Email</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Teléfono</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Pedidos</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Total Gastado</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Último Pedido</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Estado</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>
                <div className="flex items-center">
                  Nombre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Teléfono</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Pedidos
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Total Gastado
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Último Pedido
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando clientes...
                  </div>
                </TableCell>
              </TableRow>
            ) : customers.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="h-24 text-center">
                  No hay clientes disponibles.
                </TableCell>
              </TableRow>
            ) : (
              customers.map((customer) => (
                <TableRow key={customer.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <Avatar className="h-8 w-8">
                        <AvatarImage src="/placeholder-user.jpg" alt={customer.name} />
                        <AvatarFallback>{customer.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <span className="font-medium">{customer.name}</span>
                    </div>
                  </TableCell>
                  <TableCell>{customer.email}</TableCell>
                  <TableCell>{customer.phone || '-'}</TableCell>
                  <TableCell>{customer.orders}</TableCell>
                  <TableCell>${customer.totalSpent.toLocaleString("es-MX", {minimumFractionDigits: 2})}</TableCell>
                  <TableCell>{formatDate(customer.lastOrder)}</TableCell>
                  <TableCell>
                    <Badge variant={customer.status === "active" ? "default" : "outline"} className="capitalize">
                      {customer.status === "active" ? "Activo" : "Inactivo"}
                    </Badge>
                  </TableCell>
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
                        <DropdownMenuItem onClick={() => handleViewCustomer(customer)}>Ver Detalles</DropdownMenuItem>
                        <DropdownMenuItem>Editar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          {customer.status === "active" ? "Desactivar" : "Activar"}
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
          Mostrando <strong>1</strong> a <strong>{customers.length}</strong> de <strong>{customers.length}</strong>{" "}
          resultados
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

      {/* View Customer Dialog */}
      <Dialog open={isViewCustomerOpen} onOpenChange={setIsViewCustomerOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalles del Cliente</DialogTitle>
            <DialogDescription>Información completa del cliente</DialogDescription>
          </DialogHeader>

          {isLoadingDetail ? (
            <div className="flex justify-center items-center p-8">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando detalles...</span>
            </div>
          ) : customerDetail ? (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt={customerDetail.name} />
                  <AvatarFallback>{customerDetail.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{customerDetail.name}</h3>
                  <p className="text-muted-foreground">
                    Cliente desde {new Date(customerDetail.createdAt).getFullYear()}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Email</h3>
                  <p>{customerDetail.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Teléfono</h3>
                  <p>{customerDetail.phone || "-"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total de Pedidos</h3>
                  <p>{customerDetail.orders}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total Gastado</h3>
                  <p className="font-bold">
                    ${customerDetail.totalSpent.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                  </p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Último Pedido</h3>
                  <p>{formatDate(customerDetail.lastOrder)}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Estado</h3>
                  <Badge
                    variant={customerDetail.status === "active" ? "default" : "outline"}
                    className="capitalize mt-1"
                  >
                    {customerDetail.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              {customerDetail.addresses && customerDetail.addresses.length > 0 ? (
                <div>
                  <h3 className="font-medium text-sm mb-2">Direcciones</h3>
                  {customerDetail.addresses.map((address, index) => (
                    <div className="border rounded-md p-3 mb-2" key={address.id}>
                      <p className="font-medium">
                        {address.is_default ? "Principal" : `Dirección ${index + 1}`}
                      </p>
                      <p>{address.address_line1}</p>
                      {address.address_line2 && <p>{address.address_line2}</p>}
                      <p>{address.city}, {address.state}</p>
                      <p>CP: {address.postal_code}</p>
                      <p>{address.country}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <div>
                  <h3 className="font-medium text-sm mb-2">Direcciones</h3>
                  <p className="text-muted-foreground">No hay direcciones registradas</p>
                </div>
              )}

              <div>
                <h3 className="font-medium text-sm mb-2">Últimos Pedidos</h3>
                {customerDetail.recentOrders && customerDetail.recentOrders.length > 0 ? (
                  <div className="border rounded-md">
                    <div className="p-3 border-b bg-muted/50">
                      <div className="grid grid-cols-12 gap-2">
                        <div className="col-span-3 font-medium text-sm">ID</div>
                        <div className="col-span-3 font-medium text-sm">Fecha</div>
                        <div className="col-span-3 font-medium text-sm">Estado</div>
                        <div className="col-span-3 font-medium text-sm text-right">Total</div>
                      </div>
                    </div>
                    {customerDetail.recentOrders.map(order => (
                      <div className="p-3 border-b" key={order.id}>
                        <div className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-3">{order.orderNumber}</div>
                          <div className="col-span-3">{formatDate(order.date)}</div>
                          <div className="col-span-3">
                            <Badge
                              style={{backgroundColor: order.statusColor || undefined}}
                            >
                              {order.status}
                            </Badge>
                          </div>
                          <div className="col-span-3 text-right font-medium">
                            ${order.total.toLocaleString("es-MX", {minimumFractionDigits: 2})}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No hay pedidos recientes</p>
                )}
              </div>
            </div>
          ) : (
            <div className="p-4 text-center text-muted-foreground">
              No se pudieron cargar los detalles del cliente
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewCustomerOpen(false)}>
              Cerrar
            </Button>
            <Button>Editar Cliente</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default AdminCustomers