import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const orderData = await request.json();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      const statusResult = await client.query(
        'SELECT id FROM orders.order_statuses WHERE name = $1',
        ['Pendiente']
      );
      const statusId = statusResult.rows[0].id;

      const orderResult = await client.query(
        `INSERT INTO orders.orders (
          order_number, user_id, status_id, subtotal, tax, shipping_cost, 
          discount, total, payment_method, payment_status, shipping_method
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING id`,
        [
          orderData.order_number,
          orderData.user_id,
          statusId,
          orderData.subtotal,
          orderData.tax,
          orderData.shipping_cost,
          0, // discount por defecto
          orderData.total,
          orderData.payment_method,
          orderData.payment_status,
          orderData.shipping_method,
        ]
      );

      const orderId = orderResult.rows[0].id;

      for (const item of orderData.items) {
        await client.query(
          `INSERT INTO orders.order_items (
            order_id, product_id, variant_id, quantity, price, total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            item.product_id,
            item.variant_id,
            item.quantity,
            item.price,
            item.total,
          ]
        );
      }

      await client.query('COMMIT');

      return NextResponse.json({
        success: true,
        id: orderId,
        message: 'Orden creada correctamente',
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en la transacción:', error);
      return NextResponse.json(
        { success: false, message: 'Error al crear la orden' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al crear la orden:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}