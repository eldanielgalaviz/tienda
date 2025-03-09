export default function ShopPage() {
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
                  {['Sneakers', 'Ropa', 'Accesorios'].map((cat) => (
                    <div key={cat} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`cat-${cat}`} 
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <label htmlFor={`cat-${cat}`} className="ml-2 text-sm text-gray-600">
                        {cat}
                      </label>
                    </div>
                  ))}
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium mb-2">Marcas</h3>
                <div className="space-y-2">
                  {['Nike', 'Adidas', 'Puma', 'New Balance'].map((brand) => (
                    <div key={brand} className="flex items-center">
                      <input 
                        type="checkbox" 
                        id={`brand-${brand}`} 
                        className="h-4 w-4 rounded border-gray-300 text-black focus:ring-black"
                      />
                      <label htmlFor={`brand-${brand}`} className="ml-2 text-sm text-gray-600">
                        {brand}
                      </label>
                    </div>
                  ))}
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
                      />
                    </div>
                    <div>
                      <label htmlFor="max-price" className="sr-only">Precio máximo</label>
                      <input
                        type="number"
                        id="max-price"
                        placeholder="Max"
                        className="w-full border rounded p-2 text-sm"
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <button className="w-full bg-black text-white py-2 rounded">
                Aplicar Filtros
              </button>
            </div>
          </div>
        </div>
        
        <div className="md:col-span-3">
          <div className="flex justify-between items-center mb-6">
            <p className="text-sm text-gray-600">Mostrando 12 de 64 productos</p>
            <div className="flex items-center">
              <label htmlFor="sort" className="text-sm text-gray-600 mr-2">Ordenar por:</label>
              <select id="sort" className="border rounded p-1 text-sm">
                <option>Más relevantes</option>
                <option>Precio: Menor a mayor</option>
                <option>Precio: Mayor a menor</option>
                <option>Más nuevos</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Sample Products */}
            {Array.from({ length: 9 }).map((_, index) => (
              <div key={index} className="border rounded-lg overflow-hidden group">
                <div className="aspect-square relative bg-slate-100">
                  <div className="absolute inset-0 flex items-center justify-center text-slate-400">
                    Imagen del Producto
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-medium mb-1">Producto Ejemplo {index + 1}</h3>
                  <p className="text-sm text-slate-500 mb-2">Marca</p>
                  <div className="flex justify-between items-center">
                    <span className="font-bold">$129.99</span>
                    <button className="text-sm font-medium bg-black text-white px-3 py-1 rounded hover:bg-slate-800 transition-colors">
                      Añadir
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          <div className="flex justify-center mt-8">
            <nav className="inline-flex rounded-md shadow-sm">
              <a href="#" className="px-3 py-2 border rounded-l-md bg-black text-white hover:bg-slate-800">
                1
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-r text-gray-600 hover:bg-slate-100">
                2
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-r text-gray-600 hover:bg-slate-100">
                3
              </a>
              <a href="#" className="px-3 py-2 border-t border-b border-r rounded-r-md text-gray-600 hover:bg-slate-100">
                Siguiente
              </a>
            </nav>
          </div>
        </div>
      </div>
    </div>
  );
}