export default function CartPage() {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="border rounded-md">
              {/* Empty state */}
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <a href="/tienda" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                  Continuar comprando
                </a>
              </div>
              
              {/* If there were items, you would show them here */}
              {/* Example of cart item (currently hidden with className="hidden") */}
              <div className="hidden border-b p-4 flex items-center">
                <div className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded">
                  {/* Product image placeholder */}
                </div>
                
                <div className="ml-4 flex-grow">
                  <h3 className="font-medium">Nombre del Producto</h3>
                  <p className="text-sm text-gray-500">Talla: M | Color: Negro</p>
                  
                  <div className="mt-2 flex justify-between">
                    <div className="flex items-center border rounded w-24">
                      <button className="px-2 py-1">-</button>
                      <span className="px-2 flex-grow text-center">1</span>
                      <button className="px-2 py-1">+</button>
                    </div>
                    
                    <button className="text-gray-500 hover:text-red-500">
                      Eliminar
                    </button>
                  </div>
                </div>
                
                <div className="ml-4 font-bold">
                  $129.99
                </div>
              </div>
            </div>
          </div>
          
          <div className="lg:col-span-1">
            <div className="border rounded-md p-4">
              <h2 className="font-medium text-lg mb-4">Resumen de la Orden</h2>
              
              <div className="space-y-2 mb-4">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Envío</span>
                  <span>$0.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Impuestos</span>
                  <span>$0.00</span>
                </div>
              </div>
              
              <div className="border-t pt-2 mb-4">
                <div className="flex justify-between font-bold">
                  <span>Total</span>
                  <span>$0.00</span>
                </div>
              </div>
              
              <button 
                className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
                disabled
              >
                Proceder al pago
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }