"use client"

import { useState } from "react"
import { Search, Filter, MoreHorizontal, ArrowUpDown, ChevronDown } from "lucide-react"
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

const mockCustomers = [
  {
    id: "1",
    name: "Juan Pérez",
    email: "juan@ejemplo.com",
    phone: "+52 55 1234 5678",
    orders: 3,
    totalSpent: 8597,
    lastOrder: "2023-07-05",
    status: "active",
  },
  {
    id: "2",
    name: "María López",
    email: "maria@ejemplo.com",
    phone: "+52 55 2345 6789",
    orders: 1,
    totalSpent: 2499,
    lastOrder: "2023-06-20",
    status: "active",
  },
  {
    id: "3",
    name: "Carlos Rodríguez",
    email: "carlos@ejemplo.com",
    phone: "+52 55 3456 7890",
    orders: 5,
    totalSpent: 12450,
    lastOrder: "2023-07-15",
    status: "active",
  },
  {
    id: "4",
    name: "Ana Martínez",
    email: "ana@ejemplo.com",
    phone: "+52 55 4567 8901",
    orders: 2,
    totalSpent: 3297,
    lastOrder: "2023-07-10",
    status: "active",
  },
  {
    id: "5",
    name: "Roberto Sánchez",
    email: "roberto@ejemplo.com",
    phone: "+52 55 5678 9012",
    orders: 0,
    totalSpent: 0,
    lastOrder: "",
    status: "inactive",
  },
]

const AdminCustomers = () => {
  const [customers, setCustomers] = useState(mockCustomers)
  const [selectedCustomer, setSelectedCustomer] = useState<any>(null)
  const [isViewCustomerOpen, setIsViewCustomerOpen] = useState(false)

  const handleViewCustomer = (customer: any) => {
    setSelectedCustomer(customer)
    setIsViewCustomerOpen(true)
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
            {customers.map((customer) => (
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
                <TableCell>{customer.phone}</TableCell>
                <TableCell>{customer.orders}</TableCell>
                <TableCell>${customer.totalSpent.toLocaleString("es-MX")}</TableCell>
                <TableCell>{customer.lastOrder ? new Date(customer.lastOrder).toLocaleDateString() : "-"}</TableCell>
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
                      <DropdownMenuItem className="text-red-600">Desactivar</DropdownMenuItem>
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

          {selectedCustomer && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src="/placeholder-user.jpg" alt={selectedCustomer.name} />
                  <AvatarFallback>{selectedCustomer.name.charAt(0)}</AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="text-lg font-bold">{selectedCustomer.name}</h3>
                  <p className="text-muted-foreground">Cliente desde {new Date().getFullYear()}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-medium text-sm">Email</h3>
                  <p>{selectedCustomer.email}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Teléfono</h3>
                  <p>{selectedCustomer.phone}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total de Pedidos</h3>
                  <p>{selectedCustomer.orders}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Total Gastado</h3>
                  <p className="font-bold">${selectedCustomer.totalSpent.toLocaleString("es-MX")}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Último Pedido</h3>
                  <p>{selectedCustomer.lastOrder ? new Date(selectedCustomer.lastOrder).toLocaleDateString() : "-"}</p>
                </div>
                <div>
                  <h3 className="font-medium text-sm">Estado</h3>
                  <Badge
                    variant={selectedCustomer.status === "active" ? "default" : "outline"}
                    className="capitalize mt-1"
                  >
                    {selectedCustomer.status === "active" ? "Activo" : "Inactivo"}
                  </Badge>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Direcciones</h3>
                <div className="border rounded-md p-3">
                  <p className="font-medium">Casa</p>
                  <p>Calle Principal 123</p>
                  <p>Ciudad de México, CDMX</p>
                  <p>CP: 01000</p>
                </div>
              </div>

              <div>
                <h3 className="font-medium text-sm mb-2">Últimos Pedidos</h3>
                <div className="border rounded-md">
                  <div className="p-3 border-b bg-muted/50">
                    <div className="grid grid-cols-12 gap-2">
                      <div className="col-span-3 font-medium text-sm">ID</div>
                      <div className="col-span-3 font-medium text-sm">Fecha</div>
                      <div className="col-span-3 font-medium text-sm">Estado</div>
                      <div className="col-span-3 font-medium text-sm text-right">Total</div>
                    </div>
                  </div>
                  <div className="p-3 border-b">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">ORD-001</div>
                      <div className="col-span-3">15/05/2023</div>
                      <div className="col-span-3">
                        <Badge className="bg-green-500">Completado</Badge>
                      </div>
                      <div className="col-span-3 text-right font-medium">$3,999</div>
                    </div>
                  </div>
                  <div className="p-3 border-b">
                    <div className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-3">ORD-003</div>
                      <div className="col-span-3">05/07/2023</div>
                      <div className="col-span-3">
                        <Badge className="bg-green-500">Completado</Badge>
                      </div>
                      <div className="col-span-3 text-right font-medium">$4,598</div>
                    </div>
                  </div>
                </div>
              </div>
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

