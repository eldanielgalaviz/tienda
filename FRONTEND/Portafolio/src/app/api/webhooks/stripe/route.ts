// src/app/api/webhooks/stripe/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import Stripe from 'stripe';
import { headers } from 'next/headers';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16'
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

async function updateOrderStatus(paymentIntentId: string) {
  const client = await pool.connect();
  
  try {
    await client.query('BEGIN');
    
    // Buscar transacción con este payment_intent_id
    const transactionQuery = await client.query(
      `SELECT order_id FROM orders.transactions 
       WHERE gateway_reference = $1 LIMIT 1`,
      [paymentIntentId]
    );
    
    if (transactionQuery.rows.length === 0) {
      // No tenemos esta transacción registrada
      console.log(`No se encontró transacción para payment_intent_id: ${paymentIntentId}`);
      return false;
    }
    
    const orderId = transactionQuery.rows[0].order_id;
    
    // Obtener el ID del estado "Completado"
    const statusResult = await client.query(
      `SELECT id FROM orders.order_statuses WHERE name = $1`,
      ['Completado']
    );
    
    const completedStatusId = statusResult.rows[0]?.id;
    
    if (!completedStatusId) {
      throw new Error('Estado "Completado" no encontrado en la base de datos');
    }
    
    // Actualizar el estado de la orden
    await client.query(
      `UPDATE orders.orders 
       SET status_id = $1, 
           payment_status = 'paid',
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $2`,
      [completedStatusId, orderId]
    );
    
    await client.query('COMMIT');
    return true;
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al actualizar estado de la orden:', error);
    throw error;
  } finally {
    client.release();
  }
}

// export async function POST(req: Request) {
//   const body = await req.text();
//   const headersList = headers();
//   const signature = headersList.get('stripe-signature') as string;

//   let event: Stripe.Event;

//   try {
//     // Verificar que el evento viene de Stripe
//     if (endpointSecret) {
//       event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
//     } else {
//       // En desarrollo podemos saltar la verificación de firma
//       event = JSON.parse(body) as Stripe.Event;
//     }
//   } catch (err: any) {
//     console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
//   }
// }

export async function POST(req: Request) {
  const body = await req.text();
  const headersList = headers();
  const signature = headersList.get('stripe-signature') as string;

  let event: Stripe.Event;

  try {
    if (endpointSecret) {
      event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
    } else {
      event = JSON.parse(body) as Stripe.Event;
    }

    // Aquí procesa el evento, por ejemplo:
    if (event.type === 'payment_intent.succeeded') {
      const paymentIntent = event.data.object as Stripe.PaymentIntent;
      await updateOrderStatus(paymentIntent.id);
    }

    return NextResponse.json({ received: true });
  } catch (err: any) {
    console.error(`⚠️ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
