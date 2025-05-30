export default function SearchPage() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Buscar Productos</h1>
        
        <div className="max-w-2xl mx-auto mb-8">
          <div className="relative">
            <input 
              type="text"
              placeholder="Buscar productos, marcas y más..."
              className="w-full border rounded-md pl-4 pr-10 py-3 focus:outline-none focus:ring-2 focus:ring-black"
            />
            <button className="absolute right-3 top-1/2 transform -translate-y-1/2">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </button>
          </div>
        </div>
        
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">Busca productos por nombre, marca o categoría</p>
          <p className="text-sm text-gray-400">Los resultados aparecerán aquí</p>
        </div>
      </div>
    );
  }