//src/app/carrito/page.ts
'use client';

import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { useRouter } from 'next/navigation';

// Definición de tipos para mayor seguridad
interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const router = useRouter();

  // Inicializar Mercado Pago con tu clave pública
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '');
    
    // Cargar items del carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      setCartItems(JSON.parse(savedCart));
    }
  }, []);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0; // Puedes ajustar la lógica de envío
  const taxes = subtotal * 0.16; // IVA del 16%, ajusta según tu región
  const total = subtotal + shipping + taxes;

  // Manejar cambio de cantidad
  const updateQuantity = (id: string, newQuantity: number) => {
    const updatedCart = cartItems.map(item => 
      item.id === id 
        ? { ...item, quantity: Math.max(1, newQuantity) }
        : item
    );
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Eliminar item del carrito
  const removeItem = (id: string) => {
    const updatedCart = cartItems.filter(item => item.id !== id);
    
    setCartItems(updatedCart);
    localStorage.setItem('cart', JSON.stringify(updatedCart));
  };

  // Crear preferencia de pago
  const createPaymentPreference = async () => {
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            ...item,
            product_id: item.id,  // Asegúrate de que esto coincida con tu estructura de datos


          })),
          total: total,
        })
      });

      const data = await response.json();
      
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
        // Redirigir al checkout de Mercado Pago
        window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error al crear preferencia de pago:', error);
      alert('No se pudo iniciar el pago. Intenta de nuevo.');
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Tu Carrito</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <div className="border rounded-md">
            {cartItems.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
                <a 
                  href="/tienda" 
                  className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-800 transition-colors"
                >
                  Continuar comprando
                </a>
              </div>
            ) : (
              cartItems.map((item) => (
                <div key={item.id} className="border-b p-4 flex items-center">
                  <div 
                    className="h-20 w-20 flex-shrink-0 bg-slate-100 rounded bg-cover bg-center"
                    style={{ backgroundImage: `url(${item.image})` }}
                  />
                  
                  <div className="ml-4 flex-grow">
                    <h3 className="font-medium">{item.name}</h3>
                    <p className="text-sm text-gray-500">
                      {item.size && `Talla: ${item.size}`} 
                      {item.color && ` | Color: ${item.color}`}
                    </p>
                    
                    <div className="mt-2 flex justify-between">
                      <div className="flex items-center border rounded w-24">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)}
                          className="px-2 py-1"
                        >
                          -
                        </button>
                        <span className="px-2 flex-grow text-center">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)}
                          className="px-2 py-1"
                        >
                          +
                        </button>
                      </div>
                      
                      <button 
                        onClick={() => removeItem(item.id)}
                        className="text-gray-500 hover:text-red-500"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                  
                  <div className="ml-4 font-bold">
                    ${(item.price * item.quantity).toFixed(2)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
        
        <div className="lg:col-span-1">
          <div className="border rounded-md p-4">
            <h2 className="font-medium text-lg mb-4">Resumen de la Orden</h2>
            
            <div className="space-y-2 mb-4">
              <div className="flex justify-between">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Envío</span>
                <span>${shipping.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Impuestos</span>
                <span>${taxes.toFixed(2)}</span>
              </div>
            </div>
            
            <div className="border-t pt-2 mb-4">
              <div className="flex justify-between font-bold">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
            
            <button 
              onClick={createPaymentPreference}
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed"
              disabled={cartItems.length === 0}
            >
              Proceder al pago
            </button>

            {preferenceId && (
              <Wallet
                initialization={{ preferenceId: preferenceId }}
                customization={{ texts: { valueProp: 'smart_option' } }}
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}