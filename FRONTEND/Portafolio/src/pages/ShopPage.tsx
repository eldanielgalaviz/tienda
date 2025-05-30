"use client"

import { useState, useEffect } from "react"
import { useSearchParams } from "react-router-dom"
import { Filter, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import ProductCard from "@/components/product/ProductCard"
import type { Product } from "@/types"

const ShopPage = () => {
  const [searchParams, setSearchParams] = useSearchParams()
  const [products, setProducts] = useState<Product[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [priceRange, setPriceRange] = useState([0, 10000])
  const [filtersOpen, setFiltersOpen] = useState(false)

  const categoria = searchParams.get("categoria") || ""
  const etiqueta = searchParams.get("etiqueta") || ""
  const ordenar = searchParams.get("ordenar") || "recientes"

  useEffect(() => {
    // Simulación de carga de datos
    const fetchProducts = async () => {
      setIsLoading(true)
      try {
        // En una implementación real, esto sería una llamada a la API con los filtros
        // const response = await fetch(`/api/products?categoria=${categoria}&etiqueta=${etiqueta}`)
        // const data = await response.json()

        // Datos de ejemplo
        const mockProducts: Product[] = [
          {
            id: "1",
            name: "Air Jordan 1 High OG",
            price: 3999,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "destacado"],
            stock: 10,
            variants: [
              { id: "1-1", name: "Talla 7", price: 3999, stock: 2 },
              { id: "1-2", name: "Talla 8", price: 3999, stock: 3 },
              { id: "1-3", name: "Talla 9", price: 3999, stock: 5 },
            ],
          },
          {
            id: "2",
            name: "Nike Dunk Low Green",
            price: 2499,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo"],
            stock: 15,
            variants: [
              { id: "2-1", name: "Talla 7", price: 2499, stock: 5 },
              { id: "2-2", name: "Talla 8", price: 2499, stock: 5 },
              { id: "2-3", name: "Talla 9", price: 2499, stock: 5 },
            ],
          },
          {
            id: "3",
            name: "Air Jordan 1 Mid SE",
            price: 2799,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "oferta"],
            stock: 8,
            variants: [
              { id: "3-1", name: "Talla 7", price: 2799, stock: 3 },
              { id: "3-2", name: "Talla 8", price: 2799, stock: 3 },
              { id: "3-3", name: "Talla 9", price: 2799, stock: 2 },
            ],
          },
          {
            id: "4",
            name: "Adidas Superstar",
            price: 1999,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "sneakers",
            tags: ["nuevo", "oferta"],
            stock: 20,
            variants: [
              { id: "4-1", name: "Talla 7", price: 1999, stock: 7 },
              { id: "4-2", name: "Talla 8", price: 1999, stock: 7 },
              { id: "4-3", name: "Talla 9", price: 1999, stock: 6 },
            ],
          },
          {
            id: "5",
            name: "Playera Estampada",
            price: 599,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "ropa",
            tags: ["nuevo"],
            stock: 30,
            variants: [
              { id: "5-1", name: "Talla S", price: 599, stock: 10 },
              { id: "5-2", name: "Talla M", price: 599, stock: 10 },
              { id: "5-3", name: "Talla L", price: 599, stock: 10 },
            ],
          },
          {
            id: "6",
            name: "Hoodie Oversize",
            price: 899,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "ropa",
            tags: ["nuevo", "destacado"],
            stock: 25,
            variants: [
              { id: "6-1", name: "Talla S", price: 899, stock: 8 },
              { id: "6-2", name: "Talla M", price: 899, stock: 10 },
              { id: "6-3", name: "Talla L", price: 899, stock: 7 },
            ],
          },
          {
            id: "7",
            name: "Gorra Snapback",
            price: 499,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "accesorios",
            tags: ["nuevo"],
            stock: 40,
            variants: [{ id: "7-1", name: "Talla Única", price: 499, stock: 40 }],
          },
          {
            id: "8",
            name: "Mochila Urbana",
            price: 799,
            images: ["/placeholder.svg?height=300&width=300"],
            category: "accesorios",
            tags: ["destacado"],
            stock: 15,
            variants: [{ id: "8-1", name: "Talla Única", price: 799, stock: 15 }],
          },
        ]

        // Filtrar por categoría si está especificada
        let filteredProducts = mockProducts
        if (categoria) {
          filteredProducts = filteredProducts.filter((p) => p.category === categoria)
        }

        // Filtrar por etiqueta si está especificada
        if (etiqueta) {
          filteredProducts = filteredProducts.filter((p) => p.tags.includes(etiqueta))
        }

        // Ordenar productos
        if (ordenar === "precio-asc") {
          filteredProducts.sort((a, b) => a.price - b.price)
        } else if (ordenar === "precio-desc") {
          filteredProducts.sort((a, b) => b.price - a.price)
        }

        setProducts(filteredProducts)
      } catch (error) {
        console.error("Error fetching products:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchProducts()
  }, [categoria, etiqueta, ordenar])

  const updateFilters = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams)
    if (value) {
      params.set(key, value)
    } else {
      params.delete(key)
    }
    setSearchParams(params)
  }

  const clearFilters = () => {
    setSearchParams({})
    setPriceRange([0, 10000])
  }

  const getCategoryTitle = () => {
    switch (categoria) {
      case "sneakers":
        return "Sneakers"
      case "ropa":
        return "Ropa"
      case "accesorios":
        return "Accesorios"
      default:
        return "Todos los Productos"
    }
  }

  return (
    <div className="pt-16">
      <div className="container mx-auto px-4 py-12">
        <div className="flex flex-col md:flex-row gap-8">
          {/* Filters - Desktop */}
          <div className="w-full md:w-64 hidden md:block">
            <div className="sticky top-24">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-lg font-bold">Filtros</h2>
                {(categoria || etiqueta || ordenar !== "recientes") && (
                  <Button variant="ghost" size="sm" className="h-8 text-sm" onClick={clearFilters}>
                    Limpiar
                  </Button>
                )}
              </div>

              <div className="space-y-6">
                {/* Categories */}
                <div>
                  <h3 className="font-medium mb-3">Categorías</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-all"
                        checked={!categoria}
                        onCheckedChange={() => updateFilters("categoria", "")}
                      />
                      <label htmlFor="cat-all" className="text-sm cursor-pointer">
                        Todos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-sneakers"
                        checked={categoria === "sneakers"}
                        onCheckedChange={() => updateFilters("categoria", "sneakers")}
                      />
                      <label htmlFor="cat-sneakers" className="text-sm cursor-pointer">
                        Sneakers
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-ropa"
                        checked={categoria === "ropa"}
                        onCheckedChange={() => updateFilters("categoria", "ropa")}
                      />
                      <label htmlFor="cat-ropa" className="text-sm cursor-pointer">
                        Ropa
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="cat-accesorios"
                        checked={categoria === "accesorios"}
                        onCheckedChange={() => updateFilters("categoria", "accesorios")}
                      />
                      <label htmlFor="cat-accesorios" className="text-sm cursor-pointer">
                        Accesorios
                      </label>
                    </div>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <h3 className="font-medium mb-3">Etiquetas</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tag-all"
                        checked={!etiqueta}
                        onCheckedChange={() => updateFilters("etiqueta", "")}
                      />
                      <label htmlFor="tag-all" className="text-sm cursor-pointer">
                        Todos
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tag-nuevo"
                        checked={etiqueta === "nuevo"}
                        onCheckedChange={() => updateFilters("etiqueta", "nuevo")}
                      />
                      <label htmlFor="tag-nuevo" className="text-sm cursor-pointer">
                        Nuevo
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tag-oferta"
                        checked={etiqueta === "oferta"}
                        onCheckedChange={() => updateFilters("etiqueta", "oferta")}
                      />
                      <label htmlFor="tag-oferta" className="text-sm cursor-pointer">
                        Oferta
                      </label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Checkbox
                        id="tag-destacado"
                        checked={etiqueta === "destacado"}
                        onCheckedChange={() => updateFilters("etiqueta", "destacado")}
                      />
                      <label htmlFor="tag-destacado" className="text-sm cursor-pointer">
                        Destacado
                      </label>
                    </div>
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <h3 className="font-medium mb-3">Precio</h3>
                  <Slider
                    defaultValue={[0, 10000]}
                    max={10000}
                    step={100}
                    value={priceRange}
                    onValueChange={setPriceRange}
                    className="mb-6"
                  />
                  <div className="flex items-center justify-between">
                    <span className="text-sm">${priceRange[0]}</span>
                    <span className="text-sm">${priceRange[1]}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Products */}
          <div className="flex-1">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6">
              <h1 className="text-2xl font-bold mb-4 sm:mb-0">{getCategoryTitle()}</h1>

              <div className="flex items-center gap-2">
                {/* Mobile Filter Button */}
                <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="sm" className="md:hidden">
                      <Filter className="h-4 w-4 mr-2" />
                      Filtros
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-[300px] sm:w-[400px]">
                    <SheetHeader>
                      <SheetTitle>Filtros</SheetTitle>
                    </SheetHeader>
                    <div className="py-4">
                      <div className="space-y-6">
                        {/* Categories */}
                        <div>
                          <h3 className="font-medium mb-3">Categorías</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-cat-all"
                                checked={!categoria}
                                onCheckedChange={() => {
                                  updateFilters("categoria", "")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-cat-all" className="text-sm cursor-pointer">
                                Todos
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-cat-sneakers"
                                checked={categoria === "sneakers"}
                                onCheckedChange={() => {
                                  updateFilters("categoria", "sneakers")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-cat-sneakers" className="text-sm cursor-pointer">
                                Sneakers
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-cat-ropa"
                                checked={categoria === "ropa"}
                                onCheckedChange={() => {
                                  updateFilters("categoria", "ropa")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-cat-ropa" className="text-sm cursor-pointer">
                                Ropa
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-cat-accesorios"
                                checked={categoria === "accesorios"}
                                onCheckedChange={() => {
                                  updateFilters("categoria", "accesorios")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-cat-accesorios" className="text-sm cursor-pointer">
                                Accesorios
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Tags */}
                        <div>
                          <h3 className="font-medium mb-3">Etiquetas</h3>
                          <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-tag-all"
                                checked={!etiqueta}
                                onCheckedChange={() => {
                                  updateFilters("etiqueta", "")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-tag-all" className="text-sm cursor-pointer">
                                Todos
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-tag-nuevo"
                                checked={etiqueta === "nuevo"}
                                onCheckedChange={() => {
                                  updateFilters("etiqueta", "nuevo")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-tag-nuevo" className="text-sm cursor-pointer">
                                Nuevo
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-tag-oferta"
                                checked={etiqueta === "oferta"}
                                onCheckedChange={() => {
                                  updateFilters("etiqueta", "oferta")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-tag-oferta" className="text-sm cursor-pointer">
                                Oferta
                              </label>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Checkbox
                                id="m-tag-destacado"
                                checked={etiqueta === "destacado"}
                                onCheckedChange={() => {
                                  updateFilters("etiqueta", "destacado")
                                  setFiltersOpen(false)
                                }}
                              />
                              <label htmlFor="m-tag-destacado" className="text-sm cursor-pointer">
                                Destacado
                              </label>
                            </div>
                          </div>
                        </div>

                        {/* Price Range */}
                        <div>
                          <h3 className="font-medium mb-3">Precio</h3>
                          <Slider
                            defaultValue={[0, 10000]}
                            max={10000}
                            step={100}
                            value={priceRange}
                            onValueChange={setPriceRange}
                            className="mb-6"
                          />
                          <div className="flex items-center justify-between">
                            <span className="text-sm">${priceRange[0]}</span>
                            <span className="text-sm">${priceRange[1]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 flex justify-between">
                        <Button
                          variant="outline"
                          onClick={() => {
                            clearFilters()
                            setFiltersOpen(false)
                          }}
                        >
                          Limpiar
                        </Button>
                        <Button onClick={() => setFiltersOpen(false)}>Aplicar</Button>
                      </div>
                    </div>
                  </SheetContent>
                </Sheet>

                {/* Sort */}
                <Select value={ordenar} onValueChange={(value) => updateFilters("ordenar", value)}>
                  <SelectTrigger className="w-[180px]">
                    <SelectValue placeholder="Ordenar por" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recientes">Más recientes</SelectItem>
                    <SelectItem value="precio-asc">Precio: Menor a Mayor</SelectItem>
                    <SelectItem value="precio-desc">Precio: Mayor a Menor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Active Filters */}
            {(categoria || etiqueta) && (
              <div className="flex flex-wrap gap-2 mb-6">
                {categoria && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>Categoría: {getCategoryTitle()}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1 p-0"
                      onClick={() => updateFilters("categoria", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
                {etiqueta && (
                  <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 text-sm">
                    <span>Etiqueta: {etiqueta.charAt(0).toUpperCase() + etiqueta.slice(1)}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 ml-1 p-0"
                      onClick={() => updateFilters("etiqueta", "")}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            )}

            {isLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[...Array(6)].map((_, index) => (
                  <div key={index} className="animate-pulse">
                    <div className="bg-gray-200 aspect-square mb-3"></div>
                    <div className="h-4 bg-gray-200 rounded mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            ) : (
              <>
                {products.length === 0 ? (
                  <div className="text-center py-12">
                    <h3 className="text-lg font-medium mb-2">No se encontraron productos</h3>
                    <p className="text-gray-600 mb-4">Intenta con otros filtros o categorías</p>
                    <Button onClick={clearFilters}>Ver todos los productos</Button>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                    {products.map((product) => (
                      <ProductCard key={product.id} product={product} />
                    ))}
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default ShopPage

