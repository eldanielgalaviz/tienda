"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function ShopPage() {
  // Estados
  const [products, setProducts] = useState([]);
  const [filteredProducts, setFilteredProducts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [categories, setCategories] = useState([]);
  const [brands, setBrands] = useState([]);
  const [filters, setFilters] = useState({
    categories: [],
    brands: [],
    priceMin: "",
    priceMax: "",
  });
  const [sortBy, setSortBy] = useState("relevance");
  const [currentPage, setCurrentPage] = useState(1);
  const productsPerPage = 9;

  // Cargar productos, categorías y marcas
  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);
        
        // Obtener productos
        const productsRes = await fetch("/api/products?all=true");
        
        // Obtener categorías
        const categoriesRes = await fetch("/api/categories");
        
        // Obtener marcas
        const brandsRes = await fetch("/api/brands");
        
        if (!productsRes.ok || !categoriesRes.ok || !brandsRes.ok) {
          throw new Error("Error al cargar datos");
        }
        
        const [productsData, categoriesData, brandsData] = await Promise.all([
          productsRes.json(),
          categoriesRes.json(),
          brandsRes.json()
        ]);
        
        setProducts(productsData.products);
        setFilteredProducts(productsData.products);
        setCategories(categoriesData.categories);
        setBrands(brandsData.brands || []);
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchData();
  }, []);

  // Aplicar filtros y ordenamiento
  useEffect(() => {
    let result = [...products];
    
    // Filtrar por categoría
    if (filters.categories.length > 0) {
      result = result.filter(product => 
        filters.categories.includes(product.category_slug) || 
        filters.categories.includes(product.category_id)
      );
    }
    
    // Filtrar por marca
    if (filters.brands.length > 0) {
      result = result.filter(product => 
        filters.brands.includes(product.brand_slug) || 
        filters.brands.includes(product.brand_id)
      );
    }
    
    // Filtrar por precio mínimo
    if (filters.priceMin !== "") {
      const minPrice = parseFloat(filters.priceMin);
      result = result.filter(product => parseFloat(product.price) >= minPrice);
    }
    
    // Filtrar por precio máximo
    if (filters.priceMax !== "") {
      const maxPrice = parseFloat(filters.priceMax);
      result = result.filter(product => parseFloat(product.price) <= maxPrice);
    }
    
    // Ordenar productos
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => parseFloat(a.price) - parseFloat(b.price));
        break;
      case "price_desc":
        result.sort((a, b) => parseFloat(b.price) - parseFloat(a.price));
        break;
      case "newest":
        result.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
        break;
      default: // relevance or any other case
        // Por defecto podemos mantener el orden original o usar algún criterio de relevancia
        // como productos destacados primero
        result.sort((a, b) => (b.is_featured ? 1 : 0) - (a.is_featured ? 1 : 0));
        break;
    }
    
    setFilteredProducts(result);
    setCurrentPage(1); // Reset to first page when filtering
  }, [filters, sortBy, products]);

  // Manejar cambios en los filtros de categorías
  const handleCategoryChange = (categorySlug) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(categorySlug)
        ? prev.categories.filter(cat => cat !== categorySlug)
        : [...prev.categories, categorySlug];
      
      return {
        ...prev,
        categories: newCategories
      };
    });
  };

  // Manejar cambios en los filtros de marcas
  const handleBrandChange = (brandSlug) => {
    setFilters(prev => {
      const newBrands = prev.brands.includes(brandSlug)
        ? prev.brands.filter(brand => brand !== brandSlug)
        : [...prev.brands, brandSlug];
      
      return {
        ...prev,
        brands: newBrands
      };
    });
  };

  // Manejar cambios en los filtros de precio
  const handlePriceChange = (e) => {
    const { id, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [id === "min-price" ? "priceMin" : "priceMax"]: value
    }));
  };

  // Manejar cambio de ordenamiento
  const handleSortChange = (e) => {
    setSortBy(e.target.value);
  };

  // Calcular productos para la página actual
  const indexOfLastProduct = currentPage * productsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - productsPerPage;
  const currentProducts = filteredProducts.slice(indexOfFirstProduct, indexOfLastProduct);
  const totalPages = Math.ceil(filteredProducts.length / productsPerPage);

  // Función para cambiar de página
  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Formatear precio
  const formatPrice = (price) => {
    return parseFloat(price).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tienda</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="md:col-span-1">
          <div className="border rounded-md p-4 sticky top-24">
            <h2 className="font-medium mb-4">Filtros</h2>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium mb-2">Categorías</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : categories.length > 0 ? (
                    categories.map((category) => (
                      <div key={category.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`cat-${category.slug}`} 
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                          checked={filters.categories.includes(category.slug)}
                          onChange={() => handleCategoryChange(category.slug)}
                        />
                        <label htmlFor={`cat-${category.slug}`} className="ml-2 text-sm text-gray-600">
                          {category.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay categorías disponibles</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Marcas</h3>
                <div className="space-y-2">
                  {isLoading ? (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-4 w-4 animate-spin mr-2" />
                      <span className="text-sm">Cargando...</span>
                    </div>
                  ) : brands.length > 0 ? (
                    brands.map((brand) => (
                      <div key={brand.id} className="flex items-center">
                        <input 
                          type="checkbox" 
                          id={`brand-${brand.slug}`} 
                          className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                          checked={filters.brands.includes(brand.slug)}
                          onChange={() => handleBrandChange(brand.slug)}
                        />
                        <label htmlFor={`brand-${brand.slug}`} className="ml-2 text-sm text-gray-600">
                          {brand.name}
                        </label>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-gray-500">No hay marcas disponibles</p>
                  )}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Precio</h3>
                <div className="space-y-2">
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label htmlFor="min-price" className="sr-only">Precio mínimo</label>
                      <input
                        type="number"
                        id="min-price"
                        placeholder="Min"
                        className="w-full border rounded p-2 text-sm"
                        value={filters.priceMin}
                        onChange={handlePriceChange}
                      />
                    </div>
                    <div>
                      <label htmlFor="max-price" className="sr-only">Precio máximo</label>
                      <input
                        type="number"
                        id="max-price"
                        placeholder="Max"
                        className="w-full border rounded p-2 text-sm"
                        value={filters.priceMax}
                        onChange={handlePriceChange}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button 
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors"
                onClick={() => setFilters({
                  categories: [],
                  brands: [],
                  priceMin: "",
                  priceMax: ""
                })}
              >
                Restablecer Filtros
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">
              Mostrando {Math.min(filteredProducts.length, indexOfFirstProduct + 1)}-
              {Math.min(indexOfLastProduct, filteredProducts.length)} de {filteredProducts.length} productos
            </p>
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Ordenar por:</label>
              <select 
                id="sort" 
                className="border rounded p-1 text-sm"
                value={sortBy}
                onChange={handleSortChange}
              >
                <option value="relevance">Más relevantes</option>
                <option value="price_asc">Precio: Menor a mayor</option>
                <option value="price_desc">Precio: Mayor a menor</option>
                <option value="newest">Más nuevos</option>
              </select>
            </div>
          </div>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-16">
              <Loader2 className="h-8 w-8 animate-spin mr-2" />
              <span>Cargando productos...</span>
            </div>
          ) : filteredProducts.length === 0 ? (
            <div className="text-center py-16">
              <p className="text-lg text-gray-600">No se encontraron productos con los filtros seleccionados</p>
              <button 
                className="mt-4 bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                onClick={() => setFilters({
                  categories: [],
                  brands: [],
                  priceMin: "",
                  priceMax: ""
                })}
              >
                Restablecer Filtros
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentProducts.map((product) => (
                <Link
                  key={product.id}
                  href={`/producto/${product.slug}`}
                  className="border rounded-lg overflow-hidden group hover:shadow-md transition-shadow"
                >
                  <div className="aspect-square relative bg-slate-100">
                    {product.image_url ? (
                      <Image
                        src={product.image_url}
                        alt={product.name}
                        fill
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        style={{ objectFit: "cover" }}
                        className="group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                        No hay imagen
                      </div>
                    )}
                    
                    {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) && (
                      <div className="absolute top-2 left-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                        Oferta
                      </div>
                    )}
                  </div>
                  <div className="p-4">
                    <h3 className="font-medium mb-1 line-clamp-1">{product.name}</h3>
                    <p className="text-sm text-slate-500 mb-2">{product.brand_name || 'Sin marca'}</p>
                    <div className="flex justify-between items-center">
                      <div>
                        {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) ? (
                          <>
                            <span className="font-bold">{formatPrice(product.price)}</span>
                            <span className="text-sm text-slate-500 line-through ml-2">
                              {formatPrice(product.compare_at_price)}
                            </span>
                          </>
                        ) : (
                          <span className="font-bold">{formatPrice(product.price)}</span>
                        )}
                      </div>
                      <button 
                        className="text-sm font-medium bg-black text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors"
                        onClick={(e) => {
                          e.preventDefault();
                          // Aquí iría la lógica para añadir al carrito
                          console.log('Añadir al carrito:', product);
                        }}
                      >
                        Añadir
                      </button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}
          
          {filteredProducts.length > 0 && totalPages > 1 && (
            <div className="flex justify-center mt-8">
              <nav className="inline-flex rounded-md shadow-sm">
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => paginate(i + 1)}
                    className={`px-3 py-2 border ${
                      i === 0 ? 'rounded-l-md' : ''
                    } ${
                      i === totalPages - 1 ? 'rounded-r-md' : ''
                    } ${
                      currentPage === i + 1
                        ? 'bg-black text-white'
                        : 'text-gray-600 hover:bg-slate-100'
                    }`}
                  >
                    {i + 1}
                  </button>
                ))}
              </nav>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}