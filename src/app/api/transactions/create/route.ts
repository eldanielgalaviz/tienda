// src/app/api/transactions/create/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  user: process.env.DB_USER,
  host: process.env.DB_HOST,
  database: 'fashion_treats',
  password: process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT || '5432'),
});

export async function POST(request: Request) {
  try {
    const transactionData = await request.json();
    
    const result = await pool.query(
      `INSERT INTO orders.transactions (
        order_id, transaction_type, payment_method, amount, status, 
        gateway_reference, gateway_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING id`,
      [
        transactionData.order_id,
        transactionData.transaction_type,
        transactionData.payment_method,
        transactionData.amount,
        transactionData.status,
        transactionData.gateway_reference,
        transactionData.gateway_response
      ]
    );
    
    // Si la transacción es exitosa, actualizar el estado de pago en la tabla de órdenes
    if (transactionData.status === 'success') {
      await pool.query(
        `UPDATE orders.orders 
         SET payment_status = 'paid' 
         WHERE id = $1`,
        [transactionData.order_id]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      id: result.rows[0].id,
      message: 'Transacción registrada correctamente' 
    });
  } catch (error) {
    console.error('Error al registrar la transacción:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la transacción' },
      { status: 500 }
    );
  }
}