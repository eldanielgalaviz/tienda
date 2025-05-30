//src/app/api/webhooks/mercadopago/route.ts
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Payment } from 'mercadopago';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
});

// Función para verificar y ocultar productos sin stock
async function checkStockAndHideProducts(dbClient: any) {
  const productsWithZeroStock = await dbClient.query(
    `SELECT id FROM products.products WHERE stock_quantity = 0 AND is_active = true`
  );

  if (productsWithZeroStock.rows.length > 0) {
    const productIds = productsWithZeroStock.rows.map(row => row.id);
    await dbClient.query(
      `UPDATE products.products 
       SET is_active = false, updated_at = CURRENT_TIMESTAMP 
       WHERE id = ANY($1::uuid[])`,
      [productIds]
    );
  }

  return productsWithZeroStock.rows.length;
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    if (body.type === 'payment') {
      const payment = new Payment(client);
      const paymentDetails = await payment.get({ id: body.data.id });

      const dbClient = await pool.connect();

      try {
        await dbClient.query('BEGIN');

        // Buscar la orden relacionada
        const orderQuery = await dbClient.query(
          'SELECT id, status_id FROM orders.orders WHERE order_number = $1',
          [paymentDetails.external_reference]
        );

        if (orderQuery.rows.length === 0) {
          console.log('Orden no encontrada para este pago');
          return NextResponse.json({ received: true });
        }

        const order = orderQuery.rows[0];

        // Obtener los items de la orden
        const itemsQuery = await dbClient.query(
          'SELECT product_id, variant_id, quantity FROM orders.order_items WHERE order_id = $1',
          [order.id]
        );

        // Actualizar stock de productos
        for (const item of itemsQuery.rows) {
          if (item.variant_id) {
            // Actualizar stock de variante
            await dbClient.query(
              'UPDATE products.product_variants SET stock_quantity = stock_quantity - $1 WHERE id = $2',
              [item.quantity, item.variant_id]
            );
          } else {
            // Actualizar stock de producto
            await dbClient.query(
              'UPDATE products.products SET stock_quantity = stock_quantity - $1 WHERE id = $2',
              [item.quantity, item.product_id]
            );
          }
        }

        // Verificar y ocultar productos sin stock
        await checkStockAndHideProducts(dbClient);

        // Determinar estado de pago y orden
        const determineStatus = (paymentStatus: string) => {
          switch (paymentStatus) {
            case 'approved': return { payment: 'aprobado', order: 'Procesando' };
            case 'pending': return { payment: 'pendiente', order: 'Pendiente' };
            case 'in_process': return { payment: 'en_proceso', order: 'Pendiente' };
            case 'rejected': return { payment: 'rechazado', order: 'Cancelado' };
            default: return { payment: 'pendiente', order: 'Pendiente' };
          }
        };

        const { payment: paymentStatus, order: orderStatus } = determineStatus(paymentDetails.status);

        // Obtener ID del estado de orden
        const statusResult = await dbClient.query(
          'SELECT id FROM orders.order_statuses WHERE name = $1',
          [orderStatus]
        );

        // Actualizar la orden
        await dbClient.query(
          `UPDATE orders.orders 
           SET 
             payment_status = $1, 
             status_id = $2, 
             payment_details = $3,
             updated_at = CURRENT_TIMESTAMP
           WHERE id = $4`,
          [
            paymentStatus, 
            statusResult.rows[0].id, 
            JSON.stringify(paymentDetails), 
            order.id
          ]
        );

        await dbClient.query('COMMIT');

        return NextResponse.json({ received: true });
      } catch (error) {
        await dbClient.query('ROLLBACK');
        console.error('Error procesando webhook:', error);
        return NextResponse.json({ received: false }, { status: 500 });
      } finally {
        dbClient.release();
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error('Error en webhook:', error);
    return NextResponse.json({ received: false }, { status: 500 });
  }
}