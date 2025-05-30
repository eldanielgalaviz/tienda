"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useToast } from '@/components/ui/use-toast';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();
  const { toast } = useToast();
  const [isCheckingOut, setIsCheckingOut] = useState(false);

  // Cargo fijo de envío (simulado)
  const shippingCost = cart.length > 0 ? 99 : 0;
  
  // Calcular impuestos (16% IVA)
  const subtotal = getSubtotal();
  const taxes = subtotal * 0.16;
  const total = subtotal + shippingCost + taxes;

  // Formatear precios para mostrar
  const formatPrice = (price) => {
    return price.toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };

  // Manejar cambio de cantidad
  const handleQuantityChange = (productId, newQuantity) => {
    updateQuantity(productId, newQuantity);
  };

  // Manejar eliminación de producto
  const handleRemoveItem = (productId, productName) => {
    removeFromCart(productId);
    
    toast({
      title: "Producto eliminado",
      description: `${productName} ha sido eliminado de tu carrito.`,
      duration: 3000,
    });
  };

  // Simular proceso de pago
  const handleCheckout = () => {
    setIsCheckingOut(true);
    
    // Simulamos un proceso de pago con un setTimeout
    setTimeout(() => {
      clearCart();
      setIsCheckingOut(false);
      
      toast({
        title: "¡Compra realizada!",
        description: "Gracias por tu compra. Recibirás un correo con los detalles de tu pedido.",
        duration: 5000,
      });
    }, 2000);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-md">
            {cart.length === 0 ? (
              // Estado vacío
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <Link href="/tienda" className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors">
                  Continuar comprando
                </Link>
              </div>
            ) : (
              // Mostrar productos en el carrito
              <div>
                {cart.map(item => (
                  <div key={item.id} className="border-b p-4 flex items-center">
                    <div className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded relative overflow-hidden">
                      {item.image_url ? (
                        <Image
                          src={item.image_url}
                          alt={item.name}
                          fill
                          sizes="80px"
                          style={{ objectFit: "cover" }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full w-full text-gray-400 text-xs">
                          Sin imagen
                        </div>
                      )}
                    </div>
                    
                    <div className="ml-4 flex-grow">
                      <h3 className="font-medium">{item.name}</h3>
                      <p className="text-sm text-gray-500">
                        {item.brand_name ? `Marca: ${item.brand_name}` : ''}
                      </p>
                      
                      <div className="mt-2 flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1)}
                            className="text-gray-500 hover:text-black focus:outline-none"
                          >
                            <MinusCircle size={18} />
                          </button>
                          <span className="w-8 text-center">{item.quantity}</span>
                          <button 
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1)}
                            className="text-gray-500 hover:text-black focus:outline-none"
                          >
                            <PlusCircle size={18} />
                          </button>
                        </div>
                        
                        <button 
                          className="text-gray-500 hover:text-red-500 flex items-center"
                          onClick={() => handleRemoveItem(item.id, item.name)}
                        >
                          <Trash2 size={16} className="mr-1" />
                          <span className="text-sm">Eliminar</span>
                        </button>
                      </div>
                    </div>
                    
                    <div className="ml-4 font-bold">
                      {formatPrice(parseFloat(item.price) * item.quantity)}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-md p-4">
            <h2 className="font-medium text-lg mb-4">Resumen de la Orden</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>{formatPrice(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>{formatPrice(shippingCost)}</span>
              </div>
              <div className="flex justify-between">
                <span>IVA (16%)</span>
                <span>{formatPrice(taxes)}</span>
              </div>
            </div>
            
            <div className="border-t pt-2 mb-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>{formatPrice(total)}</span>
              </div>
            </div>
            
            <button 
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center"
              disabled={cart.length === 0 || isCheckingOut}
              onClick={handleCheckout}
            >
              {isCheckingOut ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Procesando...
                </>
              ) : (
                'Proceder al pago'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}