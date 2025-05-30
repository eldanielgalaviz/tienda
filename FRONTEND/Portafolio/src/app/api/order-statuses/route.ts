// src/app/api/order-statuses/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    const query = `
      SELECT 
        id, 
        name, 
        description, 
        color,
        sort_order
      FROM 
        orders.order_statuses
      WHERE 
        is_active = true
      ORDER BY 
        sort_order ASC, name ASC
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({ 
      statuses: result.rows 
    }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener estados de pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los estados de pedidos', details: error.message },
      { status: 500 }
    );
  }
}