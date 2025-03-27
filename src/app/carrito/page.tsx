'use client';

import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';

// Configuración de Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLIC_KEY || '');

interface CartItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  image: string;
  size?: string;
  color?: string;
}

// Componente de formulario de pago con Stripe
// Componente actualizado StripePaymentForm para el carrito

const StripePaymentForm = ({ total, items, onSuccess }: { total: number, items: CartItem[], onSuccess: () => void }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState(null);

  // Obtener datos del usuario actual
  useEffect(() => {
    const fetchCurrentUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        if (response.ok) {
          const data = await response.json();
          if (data.user) {
            setUser(data.user);
            console.log("Usuario obtenido para el pago:", data.user.id);
          }
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    };
    
    fetchCurrentUser();
  }, []);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!stripe || !elements) return;

    setProcessing(true);
    setErrorMessage('');

    try {
      // 1. Crear intent de pago
      const response = await fetch('/api/create-stripe-payment', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          amount: Math.round(total * 100),
          userId: user?.id // Incluir el ID del usuario si está disponible
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al crear el pago');
      }

      const { clientSecret } = await response.json();

      // 2. Confirmar pago con Stripe
      const { error, paymentIntent } = await stripe.confirmCardPayment(clientSecret, {
        payment_method: {
          card: elements.getElement(CardElement)!,
          billing_details: {
            name: user ? `${user.first_name} ${user.last_name}` : 'Cliente',
            email: user?.email
          },
        }
      });

      if (error) {
        console.error('Error de Stripe:', error);
        setErrorMessage(error.message || 'Error al procesar el pago');
        throw error;
      }

      // 3. Si el pago fue exitoso, actualizar inventario y registrar venta
      if (paymentIntent.status === 'succeeded') {
        // Convertir items del carrito al formato necesario para la API
        const orderItems = items.map(item => ({
          product_id: item.id,
          price: item.price,
          quantity: item.quantity,
          total: item.price * item.quantity,
          user_id: user?.id // Incluir el ID del usuario en cada item
        }));

        // Llamar a nuestra API para registrar la venta y actualizar inventario
        const confirmResponse = await fetch('/api/payments/stripe/confirm', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            paymentIntentId: paymentIntent.id,
            items: orderItems,
            amount: total,
            userId: user?.id // Incluir el ID del usuario en la confirmación
          })
        });

        if (!confirmResponse.ok) {
          console.error('Error al confirmar venta en sistema:', await confirmResponse.json());
          // Aún así podemos continuar, ya que el pago se realizó correctamente
        }

        // 4. Notificar éxito y redirigir
        onSuccess();
      }
    } catch (error: any) {
      console.error('Error completo:', error);
      setErrorMessage(error.message || 'Error desconocido');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="mt-4">
      <CardElement className="border p-3 rounded mb-4" />
      {errorMessage && (
        <div className="text-red-500 text-sm mb-4">
          {errorMessage}
        </div>
      )}
      <button 
        type="submit" 
        disabled={!stripe || processing}
        className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 disabled:bg-gray-300"
      >
        {processing ? 'Procesando...' : 'Pagar con Stripe'}
      </button>
    </form>
  );
};

export default function CartPage() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [preferenceId, setPreferenceId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'mercadopago' | 'stripe'>('mercadopago');
  const router = useRouter();

  // Inicializar Mercado Pago
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '', {
      locale: 'es-MX'
    });
    
    // Cargar items del carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
  }, []);

  // Calcular totales
  const subtotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0;
  const taxes = subtotal * 0.16;
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
    if (cartItems.length === 0) return;
    
    setLoading(true);
    try {
      const response = await fetch('/api/create-preference', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          items: cartItems.map(item => ({
            id: item.id,
            name: item.name,
            price: item.price,
            quantity: item.quantity,
            image: item.image,
            size: item.size,
            color: item.color,
            product_id: item.id,
          })),
          total: total,
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error || 'Error al crear el pago');
      
      if (data.preferenceId) {
        setPreferenceId(data.preferenceId);
        if (data.checkoutUrl) window.location.href = data.checkoutUrl;
      }
    } catch (error) {
      console.error('Error:', error);
      alert('No se pudo iniciar el pago. Intenta de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  // Manejar éxito de pago
  const handlePaymentSuccess = () => {
    localStorage.removeItem('cart');
    router.push('/checkout/success');
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
                          disabled={item.quantity <= 1}
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
            
            <div className="mb-4">
              <label className="block mb-2 font-medium">Método de pago</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => setPaymentMethod('mercadopago')}
                  className={`px-4 py-2 rounded ${paymentMethod === 'mercadopago' ? 'bg-black text-white' : 'bg-gray-200'}`}
                >
                  Mercado Pago
                </button>
                <button
                  onClick={() => setPaymentMethod('stripe')}
                  className={`px-4 py-2 rounded ${paymentMethod === 'stripe' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}
                >
                  Stripe
                </button>
              </div>
            </div>

            {paymentMethod === 'mercadopago' ? (
              <>
                <button 
                  onClick={createPaymentPreference}
                  className="w-full bg-black text-white py-2 rounded hover:bg-gray-800 transition-colors disabled:bg-gray-300"
                  disabled={cartItems.length === 0 || loading}
                >
                  {loading ? 'Procesando...' : 'Pagar con Mercado Pago'}
                </button>
                {preferenceId && (
                  <div className="mt-4">
                    <Wallet initialization={{ preferenceId }} />
                  </div>
                )}
              </>
            ) : (
              <Elements stripe={stripePromise}>
                <StripePaymentForm 
                  total={total} 
                  items={cartItems}
                  onSuccess={handlePaymentSuccess} 
                />
              </Elements>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}