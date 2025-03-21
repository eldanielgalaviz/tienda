import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

export async function POST(request: Request) {
  try {
    const analyticsData = await request.json();

    await pool.query(
      `INSERT INTO analytics.purchase_events (
        order_id, total_amount, products_count, products_data, created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [
        analyticsData.order_id,
        analyticsData.total_amount,
        analyticsData.products_count,
        JSON.stringify(analyticsData.products),
      ]
    );

    for (const product of analyticsData.products) {
      await pool.query(
        `INSERT INTO analytics.product_sales (
          product_id, total_sales, total_quantity, last_sale_at
        ) VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
        ON CONFLICT (product_id) 
        DO UPDATE SET 
          total_sales = analytics.product_sales.total_sales + $2,
          total_quantity = analytics.product_sales.total_quantity + $3,
          last_sale_at = CURRENT_TIMESTAMP`,
        [product.id, product.price * product.quantity, product.quantity]
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Datos analíticos registrados correctamente',
    });
  } catch (error) {
    console.error('Error al registrar datos analíticos:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar los datos analíticos' },
      { status: 500 }
    );
  }
}