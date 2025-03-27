'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckoutSuccessPage() {
  // Limpiar el carrito al cargar la página
  useEffect(() => {
    localStorage.removeItem('cart');
  }, []);

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Card className="p-8">
          <div className="flex justify-center mb-6">
            <CheckCircle size={64} className="text-green-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">¡Pago Exitoso!</h1>
          
          <p className="text-gray-600 mb-6">
            Tu pago ha sido procesado correctamente y tu pedido está en camino. 
            Recibirás un correo electrónico con los detalles de tu compra.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/tienda">
                Seguir comprando
              </Link>
            </Button>
            
            <Button variant="outline" asChild>
              <Link href="/">
                Volver al inicio
              </Link>
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}