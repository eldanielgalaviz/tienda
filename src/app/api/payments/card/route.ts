// src/app/api/payments/card/route.ts

import { NextResponse } from 'next/server';
import Conekta from 'conekta';

Conekta.api_key = process.env.CONEKTA_PRIVATE_KEY || '';

export async function POST(request: Request) {
  try {
    const { amount, email, token } = await request.json();

    const order = await Conekta.Order.create({
      line_items: [{
        name: "Compra en Tienda",
        unit_price: amount * 100, // En centavos
        quantity: 1
      }],
      currency: "MXN",
      customer_info: { 
        email,
        name: 'Cliente' // Podrías pasar el nombre del cliente
      },
      charges: [{
        payment_method: {
          type: 'card',
          token_id: token // Token de tarjeta generado por Conekta.js en el frontend
        }
      }]
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al procesar pago con tarjeta" },
      { status: 500 }
    );
  }
}