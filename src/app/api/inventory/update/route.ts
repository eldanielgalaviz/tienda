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

// src/app/api/orders/create/route.ts
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
    const orderData = await request.json();
    
    // Iniciar una transacción para crear la orden
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Obtener el ID del estado "Pendiente"
      const statusResult = await client.query(
        'SELECT id FROM orders.order_statuses WHERE name = $1',
        ['Pendiente']
      );
      const statusId = statusResult.rows[0].id;
      
      // Insertar la orden
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
          orderData.shipping_method
        ]
      );
      
      const orderId = orderResult.rows[0].id;
      
      // Insertar los items de la orden
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
            item.total
          ]
        );
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        id: orderId,
        message: 'Orden creada correctamente' 
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

// src/app/api/analytics/purchase/route.ts
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
    const analyticsData = await request.json();
    
    // Aquí puedes implementar la lógica para guardar los datos analíticos
    // Por ejemplo, se puede guardar en una tabla de analytics
    
    // Ejemplo: Insertar datos en una tabla de analytics (esta tabla la debemos crear)
    await pool.query(
      `INSERT INTO analytics.purchase_events (
        order_id, total_amount, products_count, products_data, created_at
      ) VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)`,
      [
        analyticsData.order_id,
        analyticsData.total_amount,
        analyticsData.products_count,
        JSON.stringify(analyticsData.products)
      ]
    );
    
    // Actualizar contadores de ventas por producto
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
        [
          product.id,
          product.price * product.quantity,
          product.quantity
        ]
      );
    }
    
    return NextResponse.json({ 
      success: true, 
      message: 'Datos analíticos registrados correctamente' 
    });
  } catch (error) {
    console.error('Error al registrar datos analíticos:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar los datos analíticos' },
      { status: 500 }
    );
  }
}

