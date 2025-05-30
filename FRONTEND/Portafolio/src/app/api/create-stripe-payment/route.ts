import { NextResponse } from 'next/server';
import Stripe from 'stripe';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

export async function POST(request: Request) {
  try {
    const { amount } = await request.json();
    
    // Valida el monto
    if (!amount || isNaN(amount)) {
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount), // Asegura número entero
      currency: 'mxn',
      automatic_payment_methods: { enabled: true },
      description: 'Compra en tu tienda'
    });

    if (!paymentIntent.client_secret) {
      throw new Error('No se pudo crear el intento de pago');
    }

    return NextResponse.json({ 
      clientSecret: paymentIntent.client_secret 
    });
    
  } catch (error: any) {
    console.error('Error en el servidor:', error);
    return NextResponse.json(
      { error: error.message || 'Error al procesar el pago' },
      { status: 500 }
    );
  }
}