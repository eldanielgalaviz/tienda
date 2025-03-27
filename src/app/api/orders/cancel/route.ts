// src/app/api/orders/cancel/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(request) {
  const client = await pool.connect();
  
  try {
    const { orderId, reason } = await request.json();
    
    if (!orderId) {
      return NextResponse.json(
        { error: 'Se requiere ID de pedido' },
        { status: 400 }
      );
    }
    
    await client.query('BEGIN');
    
    // Buscar estado "Cancelado"
    let statusId;
    const statusQuery = `
      SELECT id FROM orders.order_statuses 
      WHERE LOWER(name) IN ('cancelado', 'cancelled')
      LIMIT 1
    `;
    
    const statusResult = await client.query(statusQuery);
    
    if (statusResult.rows.length === 0) {
      // Si no existe, crear el estado
      const newStatusQuery = `
        INSERT INTO orders.order_statuses (name, color, is_active)
        VALUES ('Cancelado', '#EF4444', true)
        RETURNING id
      `;
      
      const newStatusResult = await client.query(newStatusQuery);
      statusId = newStatusResult.rows[0].id;
    } else {
      statusId = statusResult.rows[0].id;
    }
    
    // Actualizar el pedido a cancelado
    const updateQuery = `
      UPDATE orders.orders 
      SET 
        status_id = $1,
        payment_status = CASE 
          WHEN payment_status = 'paid' THEN 'refund_pending' 
          ELSE 'cancelled' 
        END,
        updated_at = CURRENT_TIMESTAMP,
        cancelled_at = CURRENT_TIMESTAMP,
        cancellation_reason = $2
      WHERE id = $3
      RETURNING id, order_number
    `;
    
    const result = await client.query(updateQuery, [
      statusId, 
      reason || 'Pedido cancelado desde el panel de administración', 
      orderId
    ]);
    
    if (result.rows.length === 0) {
      await client.query('ROLLBACK');
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }
    
    // Opcional: restaurar inventario de los productos
    const returnToInventoryQuery = `
      SELECT oi.product_id, oi.variant_id, oi.quantity
      FROM orders.order_items oi
      WHERE oi.order_id = $1
    `;
    
    const itemsResult = await client.query(returnToInventoryQuery, [orderId]);
    
    for (const item of itemsResult.rows) {
      if (item.variant_id) {
        // Restaurar stock de variante
        await client.query(
          `UPDATE products.product_variants 
           SET stock_quantity = stock_quantity + $1
           WHERE id = $2`,
          [item.quantity, item.variant_id]
        );
      } else {
        // Restaurar stock de producto
        await client.query(
          `UPDATE products.products 
           SET stock_quantity = stock_quantity + $1
           WHERE id = $2`,
          [item.quantity, item.product_id]
        );
      }
    }
    
    await client.query('COMMIT');
    
    return NextResponse.json({
      success: true,
      message: 'Pedido cancelado correctamente',
      order: result.rows[0]
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Error al cancelar pedido:', error);
    return NextResponse.json(
      { error: 'Error al cancelar el pedido', details: error.message },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}