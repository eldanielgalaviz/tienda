// src/app/carrito/page.tsx
"use client"

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MinusCircle, PlusCircle, Trash2 } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Footer from '@/components/layout/Footer';
import { PayPalButtons, PayPalScriptProvider } from '@paypal/react-paypal-js';

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, getSubtotal, clearCart } = useCart();
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<string | null>(null);
  const [oxxoReference, setOxxoReference] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

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
    alert(`${productName} ha sido eliminado de tu carrito.`);
  };

  // Simular proceso de pago
  const handlePayment = async () => {
    setIsProcessing(true);
    setError(null);
  
    try {
      if (!paymentMethod) {
        throw new Error('Selecciona un método de pago');
      }
  
      if (paymentMethod === 'paypal') {
        return; // PayPal se maneja automáticamente con los botones
      }
  
      const response = await fetch('/api/payments/conekta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: total,
          email: 'cliente@ejemplo.com', // Reemplaza con email real
          paymentMethod: paymentMethod === 'oxxo' ? 'oxxo_cash' : 'card'
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) throw new Error(data.error || 'Error en el pago');
  
      if (paymentMethod === 'oxxo') {
        setOxxoReference(data.charges[0].payment_method.reference);
      } else {
        clearCart();
        alert('Pago exitoso!');
      }
    } catch (err: any) {
      setError(err.message);
      console.error('Error en pago:', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const handlePayPalPayment = async () => {
    setIsProcessing(true);
    setError(null);
  
    try {
      // Validar que el total sea mayor a 0
      if (total <= 0) {
        throw new Error('El monto total debe ser mayor a cero');
      }
  
      const response = await fetch('/api/payments/paypal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: total,
          currency: 'MXN'
        })
      });
  
      const data = await response.json();
  
      if (!response.ok) {
        throw new Error(data.error || 'Error al crear orden de PayPal');
      }
  
      return data.orderID;
    } catch (err: any) {
      setError(err.message);
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };


 

  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "MXN",
        intent: "capture"
      }}
    >
      <>
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

           {/* Métodos de pago */}
            <div className="mt-4 space-y-2">
              <h3 className="font-medium">Método de pago</h3>
              <button 
                onClick={() => setPaymentMethod('paypal')}
                className="w-full bg-blue-500 text-white py-2 rounded"
              >
                PayPal
              </button>
              <button 
                onClick={() => setPaymentMethod('oxxo')}
                className="w-full bg-yellow-600 text-white py-2 rounded mt-2"
              >
                Pago en OXXO
              </button>
              <button 
                onClick={() => setPaymentMethod('card')}
                className="w-full bg-purple-600 text-white py-2 rounded mt-2"
              >
                Tarjeta de crédito/débito
              </button>
            </div>
            // Mueve estos componentes dentro del return
                {paymentMethod === 'paypal' && (
                  <div className="mt-4">
                    <PayPalButtons
                      style={{ layout: 'vertical' }}
                      createOrder={handlePayPalPayment}
                      onApprove={async (data) => {
                        try {
                          await fetch('/api/payments/paypal-capture', {
                            method: 'POST',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ orderID: data.orderID })
                          });
                          clearCart();
                          alert('Pago completado con PayPal!');
                        } catch (error) {
                          setError('Error al confirmar el pago');
                        }
                      }}
                      onError={(err) => {
                        setError(`Error de PayPal: ${err.message}`);
                      }}
                    />
                  </div>
                )}

                {oxxoReference && (
                  <div className="mt-4 p-4 bg-yellow-50 rounded">
                    <h4 className="font-bold">Instrucciones para pago en OXXO</h4>
                    <p>Referencia: <strong>{oxxoReference}</strong></p>
                    <p className="mt-2">Acude a cualquier OXXO y paga con esta referencia.</p>
                  </div>
                )}

            {/* Componentes de pago */}
            {paymentMethod === 'paypal' && (
          <PayPalButtons
            style={{ layout: 'vertical' }}
            createOrder={async () => {
              const res = await fetch('/api/payments/paypal', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ amount: total })
              });
              const { orderID } = await res.json();
              return orderID;
            }}
            onApprove={async (data) => {
              await fetch('/api/payments/paypal-capture', {
                method: 'POST',
                body: JSON.stringify({ orderID: data.orderID })
              });
              clearCart();
              alert('Pago completado con PayPal!');
            }}
          />
        )}

            {oxxoReference && (
              <div className="mt-4 p-4 bg-yellow-50 rounded">
                <h4 className="font-bold">Instrucciones para pago en OXXO</h4>
                <p>Referencia: <strong>{oxxoReference}</strong></p>
                <p className="mt-2">Acude a cualquier OXXO y paga con esta referencia.</p>
              </div>
            )}

            {/* Botón de pago principal */}
            <button 
              className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300 disabled:cursor-not-allowed flex justify-center items-center mt-4"
              disabled={cart.length === 0 || isProcessing}
              onClick={handlePayment}
            >
              {isProcessing ? (
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

            {error && (
              <div className="mt-4 p-4 bg-red-50 text-red-600 rounded">
                Error: {error}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
    <Footer />
  </>
  </PayPalScriptProvider>
);
}