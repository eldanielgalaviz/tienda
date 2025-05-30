'use client';

import { useState, useEffect } from 'react';
import { initMercadoPago, Wallet } from '@mercadopago/sdk-react';
import { loadStripe } from '@stripe/stripe-js';
import { useRouter } from 'next/navigation';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { Loader2, Edit } from 'lucide-react';

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

interface ShippingAddress {
  id?: string;
  fullName: string;
  street: string;
  number: string;
  apartment?: string;
  neighborhood: string;
  city: string;
  state: string;
  postalCode: string;
  phone: string;
}

// Componente de formulario de pago con Stripe
const StripePaymentForm = ({ total, items, selectedAddress, onSuccess }: { 
  total: number, 
  items: CartItem[], 
  selectedAddress: any,
  onSuccess: () => void 
}) => {
  const stripe = useStripe();
  const elements = useElements();
  const [processing, setProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [user, setUser] = useState<any>(null);

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
            name: user ? `${user.first_name} ${user.last_name}` : selectedAddress.fullName,
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
        }));

        // Actualizar inventario
        await fetch('/api/inventory/update', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ items: orderItems })
        });

        // Crear orden
        const orderResponse = await fetch('/api/orders/create', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            order_number: `ST-${Date.now()}`,
            user_id: user?.id,
            shipping_address_id: selectedAddress?.id,
            items: orderItems,
            subtotal: subtotal,
            tax: taxes,
            shipping_cost: shipping,
            total: total,
            payment_method: 'Stripe',
            payment_status: 'approved',
            shipping_method: 'Estándar'
          })
        });

        if (!orderResponse.ok) {
          console.error('Error al crear la orden:', await orderResponse.text());
        } else {
          const orderData = await orderResponse.json();
          
          // Registrar transacción
          await fetch('/api/transactions/create', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              order_id: orderData.id,
              transaction_type: 'payment',
              payment_method: 'stripe',
              amount: total,
              status: 'success',
              gateway_reference: paymentIntent.id,
              gateway_response: JSON.stringify(paymentIntent)
            })
          });
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
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [userAddresses, setUserAddresses] = useState<ShippingAddress[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState<string | null>(null);
  const [showNewAddressForm, setShowNewAddressForm] = useState(false);
  const [savingAddress, setSavingAddress] = useState(false);
  const [addressFormErrors, setAddressFormErrors] = useState<Record<string, string>>({});
  const [newAddress, setNewAddress] = useState<ShippingAddress>({
    fullName: '',
    street: '',
    number: '',
    apartment: '',
    neighborhood: '',
    city: '',
    state: '',
    postalCode: '',
    phone: ''
  });
  const [editingAddressId, setEditingAddressId] = useState<string | null>(null);
  
  const router = useRouter();

  // Inicializar Mercado Pago
  useEffect(() => {
    initMercadoPago(process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY || '', {
      locale: 'es-MX'
    });
    
    // Cargar items del carrito desde localStorage
    const savedCart = localStorage.getItem('cart');
    if (savedCart) setCartItems(JSON.parse(savedCart));
    
    // Obtener datos del usuario actual y sus direcciones
    fetchCurrentUser();
  }, []);

  // Obtener datos del usuario actual
  const fetchCurrentUser = async () => {
    try {
      const response = await fetch('/api/user/current');
      if (response.ok) {
        const userData = await response.json();
        setCurrentUser(userData);
        // Si hay un usuario, obtener sus direcciones
        if (userData.id) {
          fetchUserAddresses(userData.id);
        }
      }
    } catch (error) {
      console.error('Error obteniendo datos del usuario:', error);
    }
  };

  // Obtener direcciones del usuario
  const fetchUserAddresses = async (userId: string) => {
    try {
      const response = await fetch(`/api/user/addresses?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setUserAddresses(data.addresses || []);
        // Si hay direcciones, seleccionar la primera por defecto
        if (data.addresses && data.addresses.length > 0) {
          setSelectedAddressId(data.addresses[0].id);
        } else {
          // Si no hay direcciones, mostrar el formulario de nueva dirección
          setShowNewAddressForm(true);
        }
      }
    } catch (error) {
      console.error('Error obteniendo direcciones:', error);
    }
  };

  // Validar el formulario de dirección
  const validateAddressForm = (updateState = true): boolean => {
    const errors: Record<string, string> = {};
    
    if (!newAddress.fullName) errors.fullName = 'El nombre completo es obligatorio';
    if (!newAddress.street) errors.street = 'La calle es obligatoria';
    if (!newAddress.number) errors.number = 'El número exterior es obligatorio';
    if (!newAddress.neighborhood) errors.neighborhood = 'La colonia es obligatoria';
    if (!newAddress.city) errors.city = 'La ciudad es obligatoria';
    if (!newAddress.state) errors.state = 'El estado es obligatorio';
    if (!newAddress.postalCode) errors.postalCode = 'El código postal es obligatorio';
    if (!newAddress.phone) errors.phone = 'El teléfono es obligatorio';
    else if (!/^\d{10}$/.test(newAddress.phone)) errors.phone = 'El teléfono debe tener 10 dígitos';
    
    // Solo actualiza el estado si se solicita explícitamente
    if (updateState) {
      setAddressFormErrors(errors);
    }
    
    return Object.keys(errors).length === 0;
  };

  // Manejar envío del formulario (nuevo o edición)
  const handleSubmit = (e: React.FormEvent) => {
    if (editingAddressId) {
      handleUpdateAddress(e);
    } else {
      saveNewAddress(e);
    }
  };
  
  // Guardar nueva dirección
  const saveNewAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddressForm()) {
      return;
    }
    
    if (!currentUser) {
      alert('Debes iniciar sesión para guardar una dirección');
      router.push('/login?redirect=/carrito');
      return;
    }
    
    setSavingAddress(true);
    
    try {
      // Combinar calle y número si es necesario
      const streetWithNumber = newAddress.number 
        ? `${newAddress.street} ${newAddress.number}`
        : newAddress.street;
      
      const response = await fetch('/api/user/addresses', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: currentUser.id,
          address: {
            fullName: newAddress.fullName,
            street: streetWithNumber,
            apartment: newAddress.apartment,
            neighborhood: newAddress.neighborhood,
            city: newAddress.city,
            state: newAddress.state,
            postalCode: newAddress.postalCode,
            phone: newAddress.phone,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al guardar la dirección');
      }
      
      const data = await response.json();
      
      // Actualizar la lista de direcciones
      setUserAddresses([...userAddresses, data.address]);
      setSelectedAddressId(data.address.id);
      setShowNewAddressForm(false);
      
      // Limpiar el formulario
      setNewAddress({
        fullName: '',
        street: '',
        number: '',
        apartment: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        phone: ''
      });
      
    } catch (error) {
      console.error('Error guardando la dirección:', error);
      alert('Error al guardar la dirección. Intenta de nuevo.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Actualizar dirección existente
  const handleUpdateAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateAddressForm()) {
      return;
    }
    
    if (!currentUser) {
      alert('Debes iniciar sesión para actualizar una dirección');
      router.push('/login?redirect=/carrito');
      return;
    }
    
    setSavingAddress(true);
    
    try {
      // Combinar calle y número para address_line1
      const streetWithNumber = newAddress.number 
        ? `${newAddress.street} ${newAddress.number}`
        : newAddress.street;
      
      const response = await fetch('/api/user/addresses', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          addressId: editingAddressId,
          userId: currentUser.id,
          address: {
            fullName: newAddress.fullName,
            street: streetWithNumber,
            apartment: newAddress.apartment,
            neighborhood: newAddress.neighborhood,
            city: newAddress.city,
            state: newAddress.state,
            postalCode: newAddress.postalCode,
            phone: newAddress.phone,
          },
        }),
      });
      
      if (!response.ok) {
        throw new Error('Error al actualizar la dirección');
      }
      
      const data = await response.json();
      
      // Actualizar la dirección en la lista local
      setUserAddresses(userAddresses.map(addr => 
        addr.id === editingAddressId ? data.address : addr
      ));
      
      // Si la dirección editada es la seleccionada, mantenerla seleccionada
      if (selectedAddressId === editingAddressId) {
        setSelectedAddressId(data.address.id);
      }
      
      // Limpiar formulario y cerrar
      setEditingAddressId(null);
      setShowNewAddressForm(false);
      
      // Limpiar formulario
      setNewAddress({
        fullName: '',
        street: '',
        number: '',
        apartment: '',
        neighborhood: '',
        city: '',
        state: '',
        postalCode: '',
        phone: ''
      });
      
      alert('La dirección ha sido actualizada correctamente.');
      
    } catch (error) {
      console.error('Error actualizando la dirección:', error);
      alert('Error al actualizar la dirección. Intenta de nuevo.');
    } finally {
      setSavingAddress(false);
    }
  };

  // Editar dirección existente
  const editAddress = (address) => {
    // Intentar separar número de la calle si es necesario
    const streetWithNumber = address.street;
    let street = streetWithNumber;
    let number = '';
    
    // Si se necesita separar número de la calle
    const streetMatch = streetWithNumber.match(/^(.*?)\s*(\d+\s*\w*)$/);
    if (streetMatch && streetMatch.length > 2) {
      street = streetMatch[1].trim();
      number = streetMatch[2].trim();
    }
    
    setNewAddress({
      fullName: address.fullName || '',
      street: street,
      number: number,
      apartment: address.apartment || '',
      neighborhood: address.neighborhood || '',
      city: address.city,
      state: address.state,
      postalCode: address.postalCode,
      phone: address.phone || ''
    });
    
    setEditingAddressId(address.id);
    setShowNewAddressForm(true);
    
    // Scroll al formulario
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  // Manejar cambios en el formulario de dirección
  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setNewAddress(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Limpiar error del campo que se está editando
    if (addressFormErrors[name]) {
      setAddressFormErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

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

  // Obtener la dirección seleccionada
  const getSelectedAddress = () => {
    return userAddresses.find(address => address.id === selectedAddressId);
  };

  // Crear preferencia de pago
  const createPaymentPreference = async () => {
    if (cartItems.length === 0) return;
    
    // Verificar que exista una dirección seleccionada
    if (!selectedAddressId && !showNewAddressForm) {
      alert('Debes seleccionar una dirección de envío');
      return;
    }
    
    // Si se está mostrando el formulario de nueva dirección, validar y guardar primero
    if (showNewAddressForm) {
      if (!validateAddressForm()) {
        alert('Por favor completa correctamente todos los campos de dirección');
        return;
      }
      
      // Intentar guardar la dirección primero
      try {
        await saveNewAddress(new Event('submit') as any);
      } catch (error) {
        return; // Si hay error al guardar la dirección, detener el proceso
      }
    }
    
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
          user_id: currentUser?.id,
          shipping_address_id: selectedAddressId
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

  // Verificar si el usuario está logueado antes de continuar
  if (!currentUser && !loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-md mx-auto text-center">
          <h1 className="text-2xl font-bold mb-4">Iniciar sesión</h1>
          <p className="mb-6">Debes iniciar sesión para proceder con tu compra</p>
          <a 
            href={`/login?redirect=${encodeURIComponent('/carrito')}`}
            className="block w-full bg-black text-white py-2 px-4 rounded hover:bg-gray-800 transition-colors"
          >
            Iniciar sesión
          </a>
          <a 
            href={`/registro?redirect=${encodeURIComponent('/carrito')}`}
            className="block w-full mt-4 border border-black py-2 px-4 rounded hover:bg-gray-100 transition-colors"
          >
            Registrarse
          </a>
        </div>
      </div>
    );
  }

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

          {/* Sección de dirección de envío */}
          {cartItems.length > 0 && (
            <div className="mt-8 border rounded-md p-4">
              <h2 className="font-medium text-lg mb-4">
                {editingAddressId ? 'Editar dirección' : 'Dirección de Envío'}
              </h2>
              
              {userAddresses.length > 0 && !showNewAddressForm && (
                <div className="mb-4">
                  <div className="grid grid-cols-1 gap-4">
                    {userAddresses.map((address) => (
                      <div 
                        key={address.id} 
                        className={`border rounded-md p-3 cursor-pointer ${
                          selectedAddressId === address.id ? 'border-black bg-gray-50' : ''
                        }`}
                        onClick={() => setSelectedAddressId(address.id)}
                      >
                        <div className="flex items-start">
                          <input 
                            type="radio" 
                            checked={selectedAddressId === address.id} 
                            onChange={() => setSelectedAddressId(address.id)}
                            className="mt-1 mr-2" 
                          />
                          <div className="flex-grow">
                            <p className="font-medium">{address.fullName}</p>
                            <p>{address.street} {address.apartment && `, ${address.apartment}`}
                               {address.neighborhood && `, ${address.neighborhood}`}</p>
                            <p>{address.city}, {address.state}, CP: {address.postalCode}</p>
                            <p>Tel: {address.phone}</p>
                          </div>
                          <button 
                            onClick={(e) => {
                              e.stopPropagation(); // Prevenir que se seleccione al hacer clic en editar
                              editAddress(address);
                            }}
                            className="text-blue-600 hover:text-blue-800 p-1"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button 
                    className="mt-4 text-sm text-blue-600 hover:underline"
                    onClick={() => {
                      setShowNewAddressForm(true);
                      setEditingAddressId(null);
                      setNewAddress({
                        fullName: '',
                        street: '',
                        number: '',
                        apartment: '',
                        neighborhood: '',
                        city: '',
                        state: '',
                        postalCode: '',
                        phone: ''
                      });
                    }}
                  >
                    Agregar nueva dirección
                  </button>
                </div>
              )}
              
              {(showNewAddressForm || userAddresses.length === 0) && (
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium mb-1">Nombre completo</label>
                      <input 
                        type="text" 
                        name="fullName" 
                        value={newAddress.fullName} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.fullName ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.fullName && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.fullName}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Calle</label>
                      <input 
                        type="text" 
                        name="street" 
                        value={newAddress.street} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.street ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.street && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.street}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Número exterior</label>
                      <input 
                        type="text" 
                        name="number" 
                        value={newAddress.number} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.number ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.number && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.number}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Interior/Depto (opcional)</label>
                      <input 
                        type="text" 
                        name="apartment" 
                        value={newAddress.apartment} 
                        onChange={handleAddressChange} 
                        className="w-full border rounded p-2"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Colonia</label>
                      <input 
                        type="text" 
                        name="neighborhood" 
                        value={newAddress.neighborhood} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.neighborhood ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.neighborhood && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.neighborhood}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Ciudad</label>
                      <input 
                        type="text" 
                        name="city" 
                        value={newAddress.city} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.city ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.city && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.city}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Estado</label>
                      <select 
                        name="state" 
                        value={newAddress.state} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.state ? 'border-red-500' : ''}`}
                      >
                        <option value="">Selecciona un estado</option>
                        <option value="Aguascalientes">Aguascalientes</option>
                        <option value="Baja California">Baja California</option>
                        <option value="Baja California Sur">Baja California Sur</option>
                        <option value="Campeche">Campeche</option>
                        <option value="Chiapas">Chiapas</option>
                        <option value="Chihuahua">Chihuahua</option>
                        <option value="Ciudad de México">Ciudad de México</option>
                        <option value="Coahuila">Coahuila</option>
                        <option value="Colima">Colima</option>
                        <option value="Durango">Durango</option>
                        <option value="Estado de México">Estado de México</option>
                        <option value="Guanajuato">Guanajuato</option>
                        <option value="Guerrero">Guerrero</option>
                        <option value="Hidalgo">Hidalgo</option>
                        <option value="Jalisco">Jalisco</option>
                        <option value="Michoacán">Michoacán</option>
                        <option value="Morelos">Morelos</option>
                        <option value="Nayarit">Nayarit</option>
                        <option value="Nuevo León">Nuevo León</option>
                        <option value="Oaxaca">Oaxaca</option>
                        <option value="Puebla">Puebla</option>
                        <option value="Querétaro">Querétaro</option>
                        <option value="Quintana Roo">Quintana Roo</option>
                        <option value="San Luis Potosí">San Luis Potosí</option>
                        <option value="Sinaloa">Sinaloa</option>
                        <option value="Sonora">Sonora</option>
                        <option value="Tabasco">Tabasco</option>
                        <option value="Tamaulipas">Tamaulipas</option>
                        <option value="Tlaxcala">Tlaxcala</option>
                        <option value="Veracruz">Veracruz</option>
                        <option value="Yucatán">Yucatán</option>
                        <option value="Zacatecas">Zacatecas</option>
                      </select>
                      {addressFormErrors.state && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.state}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Código Postal</label>
                      <input 
                        type="text" 
                        name="postalCode" 
                        value={newAddress.postalCode} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.postalCode ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.postalCode && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.postalCode}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-1">Teléfono</label>
                      <input 
                        type="text" 
                        name="phone" 
                        value={newAddress.phone} 
                        onChange={handleAddressChange} 
                        className={`w-full border rounded p-2 ${addressFormErrors.phone ? 'border-red-500' : ''}`}
                      />
                      {addressFormErrors.phone && (
                        <p className="text-red-500 text-xs mt-1">{addressFormErrors.phone}</p>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex justify-between">
                    {userAddresses.length > 0 && (
                      <button 
                        type="button" 
                        className="text-gray-600 hover:underline"
                        onClick={() => {
                          setShowNewAddressForm(false);
                          setEditingAddressId(null);
                        }}
                      >
                        Cancelar
                      </button>
                    )}
                    <button 
                      type="submit" 
                      className="bg-black text-white px-4 py-2 rounded hover:bg-gray-800 disabled:bg-gray-400"
                      disabled={savingAddress}
                    >
                      {savingAddress ? (
                        <>
                          <Loader2 className="inline-block mr-2 h-4 w-4 animate-spin" />
                          {editingAddressId ? 'Actualizando...' : 'Guardando...'}
                        </>
                      ) : (
                        editingAddressId ? 'Actualizar dirección' : 'Guardar dirección'
                      )}
                    </button>
                  </div>
                </form>
              )}
            </div>
          )}
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
                  disabled={cartItems.length === 0 || loading || (showNewAddressForm && !validateAddressForm(false))}
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
                  selectedAddress={getSelectedAddress()}
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