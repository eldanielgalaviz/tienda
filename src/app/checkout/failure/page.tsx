'use client';

import Link from 'next/link';
import { XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function CheckoutFailurePage() {
  return (
    <div className="container mx-auto px-4 py-16">
      <div className="max-w-md mx-auto text-center">
        <Card className="p-8">
          <div className="flex justify-center mb-6">
            <XCircle size={64} className="text-red-500" />
          </div>
          
          <h1 className="text-2xl font-bold mb-4">Pago No Completado</h1>
          
          <p className="text-gray-600 mb-6">
            Lo sentimos, hubo un problema al procesar tu pago. No te preocupes, 
            no se ha realizado ningún cargo a tu tarjeta. Por favor, intenta nuevamente.
          </p>
          
          <div className="flex flex-col gap-3">
            <Button asChild>
              <Link href="/carrito">
                Volver al carrito
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