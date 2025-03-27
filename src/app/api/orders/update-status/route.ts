// src/app/api/orders/update-status/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(request) {
  try {
    const { orderId, statusId } = await request.json();
    
    if (!orderId || !statusId) {
      return NextResponse.json(
        { error: 'Se requieren ID de pedido y estado' },
        { status: 400 }
      );
    }
    
    // Obtener información del estado
    const statusQuery = `
      SELECT name FROM orders.order_statuses WHERE id = $1
    `;
    const statusResult = await pool.query(statusQuery, [statusId]);
    
    if (statusResult.rows.length === 0) {
      return NextResponse.json(
        { error: 'Estado no encontrado' },
        { status: 404 }
      );
    }
    
    const statusName = statusResult.rows[0].name;
    
    // Actualizar el estado del pedido
    const updateQuery = `
      UPDATE orders.orders 
      SET 
        status_id = $1,
        updated_at = CURRENT_TIMESTAMP,
        completed_at = CASE 
          WHEN LOWER($2) LIKE '%complet%' OR LOWER($2) LIKE '%entregad%' THEN CURRENT_TIMESTAMP 
          ELSE completed_at 
        END
      WHERE id = $3
      RETURNING id, order_number
    `;
    
    const result = await pool.query(updateQuery, [statusId, statusName, orderId]);
    
    if (result.rows.length === 0) {
      return NextResponse.json(
        { error: 'Pedido no encontrado' },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      success: true,
      message: `Estado actualizado a "${statusName}"`,
      order: result.rows[0]
    });
  } catch (error) {
    console.error('Error al actualizar estado del pedido:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el estado del pedido', details: error.message },
      { status: 500 }
    );
  }
}