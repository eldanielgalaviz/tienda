"use client"

import { useState, useEffect } from "react"
import { Plus, Search, Filter, MoreHorizontal, ArrowUpDown, ChevronDown, Loader2, Upload, AlertTriangle, Eye, EyeOff } from "lucide-react"
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
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/components/ui/use-toast"

const AdminProducts = () => {
  const [products, setProducts] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [isAddProductOpen, setIsAddProductOpen] = useState(false)
  const [isEditProductOpen, setIsEditProductOpen] = useState(false)
  const [isChangeStatusDialogOpen, setIsChangeStatusDialogOpen] = useState(false)
  const [selectedProduct, setSelectedProduct] = useState(null)
  const [categories, setCategories] = useState([])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [formData, setFormData] = useState({
    id: "",
    name: "",
    sku: "",
    price: "",
    category: "",
    stock: "",
    description: "",
    image: null,
    is_active: true
  })
  const [imagePreview, setImagePreview] = useState(null)
  const { toast } = useToast()

  // Fetch products from API
  const fetchProducts = async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/products?admin=true')
      if (!response.ok) {
        throw new Error('Error al cargar productos')
      }
      const data = await response.json()
      setProducts(data.products)
    } catch (error) {
      console.error('Error fetching products:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los productos",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    fetchProducts()
  }, [])

  // Fetch categories for the product form
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const response = await fetch('/api/categories')
        if (response.ok) {
          const data = await response.json()
          setCategories(data.categories)
        }
      } catch (error) {
        console.error('Error fetching categories:', error)
      }
    }

    fetchCategories()
  }, [])

  // Función para obtener detalles de un producto para editar
  const fetchProductDetails = async (productId) => {
    try {
      setIsSubmitting(true)
      const response = await fetch(`/api/products?id=${productId}`)
      if (!response.ok) {
        throw new Error('Error al cargar detalles del producto')
      }
      
      const data = await response.json()
      const product = data.product
      
      setFormData({
        id: product.id,
        name: product.name,
        sku: product.sku || "",
        price: product.price.toString(),
        category: product.main_category_id,
        stock: product.stock.toString(),
        description: product.description || "",
        image: null,
        is_active: product.is_active
      })
      
      // Si el producto tiene una imagen, establecer la vista previa
      if (product.images && product.images.length > 0) {
        const primaryImage = product.images.find(img => img.is_primary) || product.images[0]
        setImagePreview(primaryImage.image_url)
      } else {
        setImagePreview(null)
      }
      
      setIsEditProductOpen(true)
    } catch (error) {
      console.error('Error fetching product details:', error)
      toast({
        title: "Error",
        description: "No se pudieron cargar los detalles del producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleInputChange = (e) => {
    const { id, value } = e.target
    setFormData(prev => ({ ...prev, [id]: value }))
  }

  const handleCategoryChange = (value) => {
    setFormData(prev => ({ ...prev, category: value }))
  }

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      setFormData(prev => ({ ...prev, image: file }))
      
      // Crear una URL para la vista previa de la imagen
      const fileReader = new FileReader()
      fileReader.onload = (e) => {
        setImagePreview(e.target.result)
      }
      fileReader.readAsDataURL(file)
    }
  }

  const handleActiveChange = (checked) => {
    setFormData(prev => ({ ...prev, is_active: checked }))
  }

  const resetForm = () => {
    setFormData({
      id: "",
      name: "",
      sku: "",
      price: "",
      category: "",
      stock: "",
      description: "",
      image: null,
      is_active: true
    })
    setImagePreview(null)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Crear FormData para enviar datos y la imagen
      const form = new FormData()
      form.append('name', formData.name)
      form.append('sku', formData.sku)
      form.append('price', formData.price)
      form.append('category', formData.category)
      form.append('stock', formData.stock)
      form.append('description', formData.description)
      
      // Añadir la imagen si existe
      if (formData.image) {
        form.append('image', formData.image)
      }

      const response = await fetch('/api/products', {
        method: 'POST',
        body: form,
      })

      if (!response.ok) {
        throw new Error('Error al crear producto')
      }

      // Recargar productos
      await fetchProducts()
      
      setIsAddProductOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Producto creado correctamente",
      })
    } catch (error) {
      console.error('Error creating product:', error)
      toast({
        title: "Error",
        description: "No se pudo crear el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    
    try {
      setIsSubmitting(true)
      
      // Crear FormData para enviar datos y la imagen
      const form = new FormData()
      form.append('id', formData.id)
      form.append('name', formData.name)
      form.append('sku', formData.sku)
      form.append('price', formData.price)
      form.append('category', formData.category)
      form.append('stock', formData.stock)
      form.append('description', formData.description)
      form.append('is_active', formData.is_active.toString())
      
      // Añadir la imagen si existe una nueva
      if (formData.image) {
        form.append('image', formData.image)
      }

      const response = await fetch('/api/products', {
        method: 'PUT',
        body: form,
      })

      if (!response.ok) {
        throw new Error('Error al actualizar producto')
      }

      // Recargar productos
      await fetchProducts()
      
      setIsEditProductOpen(false)
      resetForm()
      
      toast({
        title: "Éxito",
        description: "Producto actualizado correctamente",
      })
    } catch (error) {
      console.error('Error updating product:', error)
      toast({
        title: "Error",
        description: "No se pudo actualizar el producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleToggleStatus = async () => {
    if (!selectedProduct) return
    
    try {
      setIsSubmitting(true)
      
      // Corregimos la lógica para cambiar el estado
      // Necesitamos invertir el valor actual de is_active
      const newActiveState = !selectedProduct.is_active
      
      console.log("Estado actual:", selectedProduct.is_active)
      console.log("Nuevo estado:", newActiveState)
      
      // Usar el método PATCH para cambiar estado
      const response = await fetch('/api/products', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedProduct.id,
          isActive: newActiveState // Enviamos el estado invertido
        }),
      })
  
      if (!response.ok) {
        throw new Error('Error al cambiar estado del producto')
      }
  
      // Recargar productos
      await fetchProducts()
      
      setIsChangeStatusDialogOpen(false)
      setSelectedProduct(null)
      
      toast({
        title: "Éxito",
        description: newActiveState 
          ? "Producto activado correctamente" 
          : "Producto desactivado correctamente",
      })
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast({
        title: "Error",
        description: "No se pudo cambiar el estado del producto",
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  const getStatusLabel = (status) => {
    switch (status) {
      case 'active':
        return 'Activo'
      case 'out_of_stock':
        return 'Agotado'
      case 'low_stock':
        return 'Stock Bajo'
      case 'inactive':
        return 'Inactivo'
      default:
        return status
    }
  }

  // Función para formatear el precio
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('es-MX', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })
  }

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
            <form onSubmit={handleSubmit}>
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
                    <Input 
                      id="name" 
                      placeholder="Nombre del producto" 
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="sku">SKU</Label>
                    <Input 
                      id="sku" 
                      placeholder="SKU" 
                      value={formData.sku}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="price">Precio</Label>
                    <Input 
                      id="price" 
                      type="number" 
                      placeholder="0.00" 
                      min="0" 
                      step="0.01"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div>
                    <Label htmlFor="category">Categoría</Label>
                    <Select 
                      value={formData.category} 
                      onValueChange={handleCategoryChange}
                      required
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length > 0 ? (
                          categories.map(category => (
                            <SelectItem key={category.id} value={category.id}>
                              {category.name}
                            </SelectItem>
                          ))
                        ) : (
                          <>
                            <SelectItem value="sneakers">Sneakers</SelectItem>
                            <SelectItem value="ropa">Ropa</SelectItem>
                            <SelectItem value="accesorios">Accesorios</SelectItem>
                          </>
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="stock">Stock</Label>
                    <Input 
                      id="stock" 
                      type="number" 
                      placeholder="0" 
                      min="0"
                      value={formData.stock}
                      onChange={handleInputChange}
                      required
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="description">Descripción</Label>
                    <Textarea 
                      id="description" 
                      placeholder="Descripción del producto"
                      value={formData.description}
                      onChange={handleInputChange}
                    />
                  </div>
                  <div className="col-span-2">
                    <Label htmlFor="image">Imagen del Producto</Label>
                    <div className="mt-1 flex items-center">
                      <label 
                        htmlFor="image" 
                        className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 w-full text-center hover:bg-gray-50 transition-colors"
                      >
                        {imagePreview ? (
                          <div className="flex flex-col items-center">
                            <img 
                              src={imagePreview} 
                              alt="Vista previa" 
                              className="w-auto h-32 object-contain mb-2"
                            />
                            <p className="text-sm text-gray-500">Haz clic para cambiar la imagen</p>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center">
                            <Upload className="h-10 w-10 text-gray-400 mb-2" />
                            <p className="text-sm text-gray-500">Haz clic para subir una imagen</p>
                            <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                          </div>
                        )}
                        <Input 
                          id="image" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleImageChange}
                        />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <DialogFooter>
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => {
                    setIsAddProductOpen(false)
                    resetForm()
                  }}
                  disabled={isSubmitting}
                >
                  Cancelar
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Guardando...
                    </>
                  ) : (
                    'Guardar'
                  )}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Dialog para editar producto */}
      <Dialog open={isEditProductOpen} onOpenChange={setIsEditProductOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <form onSubmit={handleUpdate}>
            <DialogHeader>
              <DialogTitle>Editar Producto</DialogTitle>
              <DialogDescription>
                Actualiza los detalles del producto. Haz clic en guardar cuando hayas terminado.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <Label htmlFor="name">Nombre del Producto</Label>
                  <Input 
                    id="name" 
                    placeholder="Nombre del producto" 
                    value={formData.name}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input 
                    id="sku" 
                    placeholder="SKU" 
                    value={formData.sku}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="price">Precio</Label>
                  <Input 
                    id="price" 
                    type="number" 
                    placeholder="0.00" 
                    min="0" 
                    step="0.01"
                    value={formData.price}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="category">Categoría</Label>
                  <Select 
                    value={formData.category} 
                    onValueChange={handleCategoryChange}
                    required
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Seleccionar categoría" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.length > 0 ? (
                        categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="sneakers">Sneakers</SelectItem>
                          <SelectItem value="ropa">Ropa</SelectItem>
                          <SelectItem value="accesorios">Accesorios</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="stock">Stock</Label>
                  <Input 
                    id="stock" 
                    type="number" 
                    placeholder="0" 
                    min="0"
                    value={formData.stock}
                    onChange={handleInputChange}
                    required
                  />
                </div>
                <div className="col-span-2 flex items-center space-x-2">
                  <Label htmlFor="is_active">Estado del producto</Label>
                  <div className="flex items-center space-x-2">
                    <Switch 
                      id="is_active" 
                      checked={formData.is_active}
                      onCheckedChange={handleActiveChange}
                    />
                    <Label htmlFor="is_active" className="cursor-pointer">
                      {formData.is_active ? 'Activo' : 'Inactivo'}
                    </Label>
                  </div>
                </div>
                <div className="col-span-2">
                  <Label htmlFor="description">Descripción</Label>
                  <Textarea 
                    id="description" 
                    placeholder="Descripción del producto"
                    value={formData.description}
                    onChange={handleInputChange}
                  />
                </div>
                <div className="col-span-2">
                  <Label htmlFor="image">Imagen del Producto</Label>
                  <div className="mt-1 flex items-center">
                    <label 
                      htmlFor="edit-image" 
                      className="cursor-pointer border-2 border-dashed border-gray-300 rounded-md p-6 w-full text-center hover:bg-gray-50 transition-colors"
                    >
                      {imagePreview ? (
                        <div className="flex flex-col items-center">
                          <img 
                            src={imagePreview} 
                            alt="Vista previa" 
                            className="w-auto h-32 object-contain mb-2"
                          />
                          <p className="text-sm text-gray-500">Haz clic para cambiar la imagen</p>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center">
                          <Upload className="h-10 w-10 text-gray-400 mb-2" />
                          <p className="text-sm text-gray-500">Haz clic para subir una imagen</p>
                          <p className="text-xs text-gray-400 mt-1">PNG, JPG, WEBP hasta 5MB</p>
                        </div>
                      )}
                      <Input 
                        id="edit-image" 
                        type="file" 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageChange}
                      />
                    </label>
                  </div>
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button 
                variant="outline" 
                type="button" 
                onClick={() => {
                  setIsEditProductOpen(false)
                  resetForm()
                }}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Actualizando...
                  </>
                ) : (
                  'Actualizar'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Alert Dialog para cambiar estado */}
      <AlertDialog open={isChangeStatusDialogOpen} onOpenChange={setIsChangeStatusDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {selectedProduct?.is_active ? "¿Ocultar producto?" : "¿Mostrar producto?"}
            </AlertDialogTitle>
            <AlertDialogDescription>
              {selectedProduct?.is_active 
                ? `¿Deseas ocultar el producto "${selectedProduct?.name}"? El producto ya no será visible en la tienda, pero seguirá apareciendo en el panel de administración.`
                : `¿Deseas mostrar el producto "${selectedProduct?.name}"? El producto volverá a ser visible en la tienda.`
              }
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isSubmitting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleToggleStatus} 
              disabled={isSubmitting}
              className={selectedProduct?.is_active 
                ? "bg-red-600 hover:bg-red-700 focus:ring-red-600" 
                : "bg-green-600 hover:bg-green-700 focus:ring-green-600"
              }
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Procesando...
                </>
              ) : selectedProduct?.is_active ? (
                <>
                  <EyeOff className="h-4 w-4 mr-2" />
                  Ocultar
                </>
              ) : (
                <>
                  <Eye className="h-4 w-4 mr-2" />
                  Mostrar
                </>
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
              <TableHead>Visibilidad</TableHead>
              <TableHead className="w-[80px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  <div className="flex justify-center items-center">
                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                    Cargando productos...
                  </div>
                </TableCell>
              </TableRow>
            ) : products.length === 0 ? (
              <TableRow>
                <TableCell colSpan={9} className="h-24 text-center">
                  No hay productos disponibles.
                </TableCell>
              </TableRow>
            ) : (
              products.map((product) => (
                <TableRow 
                  key={product.id}
                  className={product.status === 'inactive' ? 'bg-gray-50' : ''}
                >
                  <TableCell>
                    <img
                      src={product.image_url || "/placeholder.svg?height=40&width=40"}
                      alt={product.name}
                      className={`w-10 h-10 rounded-md object-cover ${product.status === 'inactive' ? 'opacity-50' : ''}`}
                    />
                  </TableCell>
                  <TableCell className={`font-medium ${product.status === 'inactive' ? 'text-gray-500' : ''}`}>
                    {product.name}
                  </TableCell>
                  <TableCell className={product.status === 'inactive' ? 'text-gray-500' : ''}>
                    {product.sku}
                  </TableCell>
                  <TableCell className={product.status === 'inactive' ? 'text-gray-500' : ''}>
                    ${formatPrice(product.price)}
                  </TableCell>
                  <TableCell className={product.status === 'inactive' ? 'text-gray-500' : ''}>
                    {product.stock}
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant="outline" 
                      className={`capitalize ${product.status === 'inactive' ? 'opacity-50' : ''}`}
                    >
                      {product.category_name || product.category_slug || 'Sin categoría'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        product.status === "active"
                          ? "default"
                          : product.status === "out_of_stock"
                            ? "destructive"
                            : product.status === "inactive"
                              ? "outline"
                              : "secondary"
                      }
                      className="capitalize"
                    >
                      {getStatusLabel(product.status)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={product.is_active ? "default" : "outline"}
                      className={product.is_active 
                        ? "bg-green-100 text-green-800 hover:bg-green-200" 
                        : "bg-red-100 text-red-800 hover:bg-red-200"
                      }
                    >
                      {product.is_active ? "Visible" : "Oculto"}
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
                        <DropdownMenuItem onClick={() => fetchProductDetails(product.id)}>
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem>Duplicar</DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => {
                            setSelectedProduct(product)
                            setIsChangeStatusDialogOpen(true)
                          }}
                          className={product.is_active ? 'text-red-600' : 'text-green-600'}
                        >
                          {product.is_active ? (
                            <>
                              <EyeOff className="h-4 w-4 mr-2" />
                              Ocultar
                            </>
                          ) : (
                            <>
                              <Eye className="h-4 w-4 mr-2" />
                              Mostrar
                            </>
                          )}
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
          Mostrando <strong>1</strong> a <strong>{products.length}</strong> de <strong>{products.length}</strong> resultados
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