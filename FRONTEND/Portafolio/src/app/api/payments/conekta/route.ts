// src/app/api/payments/conekta/route.ts

import { NextResponse } from 'next/server';
import Conekta from 'conekta';

Conekta.api_key = process.env.CONEKTA_PRIVATE_KEY || '';

export async function POST(request: Request) {
  try {
    const { amount, email, paymentMethod } = await request.json();

    const order = await Conekta.Order.create({
      line_items: [{
        name: "Compra en Tienda",
        unit_price: amount * 100, // En centavos
        quantity: 1
      }],
      currency: "MXN",
      customer_info: { email },
      charges: [{
        payment_method: {
          type: paymentMethod // "oxxo_cash" o "card"
        }
      }]
    });

    return NextResponse.json(order);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Error al procesar el pago" },
      { status: 500 }
    );
  }
}