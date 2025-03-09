"use client"

import { useState } from "react"
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, ChevronDown } from "lucide-react"
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
  DialogTrigger,
} from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const mockProducts = [
  {
    id: "1",
    name: "Air Jordan 1 High OG",
    sku: "AJ1-001",
    price: 3999,
    stock: 10,
    category: "sneakers",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "2",
    name: "Nike Dunk Low Green",
    sku: "ND-002",
    price: 2499,
    stock: 15,
    category: "sneakers",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "3",
    name: "Air Jordan 1 Mid SE",
    sku: "AJ1M-003",
    price: 2799,
    stock: 8,
    category: "sneakers",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "4",
    name: "Adidas Superstar",
    sku: "AS-004",
    price: 1999,
    stock: 20,
    category: "sneakers",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "5",
    name: "Playera Estampada",
    sku: "PE-005",
    price: 599,
    stock: 30,
    category: "ropa",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "6",
    name: "Hoodie Oversize",
    sku: "HO-006",
    price: 899,
    stock: 25,
    category: "ropa",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "7",
    name: "Gorra Snapback",
    sku: "GS-007",
    price: 499,
    stock: 40,
    category: "accesorios",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "8",
    name: "Mochila Urbana",
    sku: "MU-008",
    price: 799,
    stock: 15,
    category: "accesorios",
    status: "active",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "9",
    name: "Vans Old Skool",
    sku: "VOS-009",
    price: 1499,
    stock: 0,
    category: "sneakers",
    status: "out_of_stock",
    image: "/placeholder.svg?height=40&width=40",
  },
  {
    id: "10",
    name: "Camiseta Básica",
    sku: "CB-010",
    price: 399,
    stock: 5,
    category: "ropa",
    status: "low_stock",
    image: "/placeholder.svg?height=40&width=40",
  },
]

const AdminProducts = () => {
  const [products, setProducts] = useState(mockProducts)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Productos</h1>
        <Dialog open={isAddProductOpen} onOpenChange={setIsAddProductOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Añadir Producto
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Añadir Nuevo Producto</DialogTitle>
              <DialogDescription>
                Completa los detalles del producto. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input id="name" placeholder="Nombre del producto" />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input id="sku" placeholder="SKU" />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input id="price" type="number" placeholder="0.00" />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sneakers">Sneakers</SelectItem>
                      <SelectItem value="ropa">Ropa</SelectItem>
                      <SelectItem value="accesorios">Accesorios</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea id="description" placeholder="Descripción del producto" />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Imágenes</Label>
                  <Input id="image" type="file" multiple />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsAddProductOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit">Guardar</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row gap-4 mb-6">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input placeholder="Buscar productos..." className="pl-8" />
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
              <DropdownMenuCheckboxItem checked>Imagen</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Nombre</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>SKU</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Precio</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Stock</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Categoría</DropdownMenuCheckboxItem>
              <DropdownMenuCheckboxItem checked>Estado</DropdownMenuCheckboxItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[80px]">Imagen</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Nombre
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>SKU</TableHead>
              <TableHead>
                <div className="flex items-center">
                  Precio
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>
                <div className="flex items-center">
                  Stock
                  <ArrowUpDown className="ml-2 h-4 w-4" />
                </div>
              </TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Estado</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => (
              <TableRow key={product.id}>
                <TableCell>
                  <img
                    src={product.image || "/placeholder.svg"}
                    alt={product.name}
                    className="w-10 h-10 rounded-md object-cover"
                  />
                </TableCell>
                <TableCell className="font-medium">{product.name}</TableCell>
                <TableCell>{product.sku}</TableCell>
                <TableCell>${product.price.toLocaleString("es-MX")}</TableCell>
                <TableCell>{product.stock}</TableCell>
                <TableCell>
                  <Badge variant="outline" className="capitalize">
                    {product.category}
                  </Badge>
                </TableCell>
                <TableCell>
                  <Badge
                    variant={
                      product.status === "active"
                        ? "default"
                        : product.status === "out_of_stock"
                          ? "destructive"
                          : "outline"
                    }
                    className="capitalize"
                  >
                    {product.status === "active"
                      ? "Activo"
                      : product.status === "out_of_stock"
                        ? "Agotado"
                        : "Stock Bajo"}
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
                      <DropdownMenuItem>Editar</DropdownMenuItem>
                      <DropdownMenuItem>Duplicar</DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem className="text-red-600">Eliminar</DropdownMenuItem>
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
          Mostrando <strong>1</strong> a <strong>{products.length}</strong> de <strong>{products.length}</strong>{" "}
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
    </div>
  )
}

export default AdminProducts

