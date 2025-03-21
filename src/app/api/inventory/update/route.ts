// src/app/api/inventory/update/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
  });

export async function POST(request: Request) {
  try {
    const { items } = await request.json();
    
    // Iniciar una transacción para actualizar el inventario
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Actualizar el inventario para cada producto
      for (const item of items) {
        // Primero, verifica si es una variante o un producto principal
        if (item.variant_id) {
          // Actualizar stock de la variante
          await client.query(
            `UPDATE products.product_variants 
             SET stock_quantity = stock_quantity - $1 
             WHERE id = $2`,
            [item.quantity, item.variant_id]
          );
        } else {
          // Actualizar stock del producto principal
          await client.query(
            `UPDATE products.products 
             SET stock_quantity = stock_quantity - $1 
             WHERE id = $2`,
            [item.quantity, item.product_id]
          );
        }
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        message: 'Inventario actualizado correctamente' 
      });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error en la transacción:', error);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar el inventario' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al actualizar el inventario:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}

