// src/app/api/payments/stripe/confirm/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Función para actualizar el inventario
async function updateInventory(items, client) {
  try {
    // Actualizar el stock para cada producto o variante
    for (const item of items) {
      let updateQuery;
      let updateParams;

      if (item.variant_id) {
        // Actualizar stock de la variante
        updateQuery = `
          UPDATE products.product_variants 
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `;
        updateParams = [item.quantity, item.variant_id];
      } else {
        // Actualizar stock del producto principal
        updateQuery = `
          UPDATE products.products 
          SET stock_quantity = stock_quantity - $1
          WHERE id = $2
        `;
        updateParams = [item.quantity, item.product_id];
      }

      await client.query(updateQuery, updateParams);
    }

    // Verificar y ocultar productos con stock en 0
    const productsWithZeroStock = await client.query(
      `SELECT id FROM products.products WHERE stock_quantity <= 0 AND is_active = true`
    );

    if (productsWithZeroStock.rows.length > 0) {
      const productIds = productsWithZeroStock.rows.map(row => row.id);
      await client.query(
        `UPDATE products.products 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1::uuid[])`,
        [productIds]
      );
    }

    return true;
  } catch (error) {
    console.error('Error actualizando inventario:', error);
    throw error;
  }
}

// Función para registrar la transacción
async function registerTransaction(orderId, paymentIntentId, amount, status, client) {
  try {
    await client.query(
      `INSERT INTO orders.transactions (
        order_id, transaction_type, payment_method, amount, status, 
        gateway_reference, gateway_response
      ) VALUES ($1, $2, $3, $4, $5, $6, $7)`,
      [
        orderId,
        'payment',
        'stripe',
        amount,
        status,
        paymentIntentId,
        JSON.stringify({ payment_intent_id: paymentIntentId })
      ]
    );

    return true;
  } catch (error) {
    console.error('Error registrando transacción:', error);
    throw error;
  }
}

// Función para obtener un ID de estado válido
async function getValidOrderStatusId(client, statusName = null) {
  try {
    // Si se proporciona un nombre específico, búscalo primero
    if (statusName) {
      // Intentar búsqueda exacta
      const exactResult = await client.query(
        'SELECT id FROM orders.order_statuses WHERE name = $1',
        [statusName]
      );
      
      if (exactResult.rows.length > 0) {
        return exactResult.rows[0].id;
      }
      
      // Intentar búsqueda insensible a mayúsculas/minúsculas
      const caseInsensitiveResult = await client.query(
        'SELECT id FROM orders.order_statuses WHERE LOWER(name) = LOWER($1)',
        [statusName]
      );
      
      if (caseInsensitiveResult.rows.length > 0) {
        return caseInsensitiveResult.rows[0].id;
      }
    }
    
    // Si no encontramos el estado específico o no se proporcionó ninguno,
    // buscar cualquier estado que pueda ser apropiado para una orden completada
    const fallbackResult = await client.query(`
      SELECT id FROM orders.order_statuses 
      WHERE LOWER(name) IN ('completado', 'completed', 'procesando', 'processing', 'pagado', 'paid', 'enviado', 'shipped')
      LIMIT 1
    `);
    
    if (fallbackResult.rows.length > 0) {
      return fallbackResult.rows[0].id;
    }
    
    // Si todavía no encontramos un estado válido, obtener cualquier estado (como último recurso)
    const anyStatusResult = await client.query(
      'SELECT id FROM orders.order_statuses LIMIT 1'
    );
    
    if (anyStatusResult.rows.length > 0) {
      return anyStatusResult.rows[0].id;
    }
    
    // Si no hay estados en la tabla, crear uno
    const newStatusResult = await client.query(
      `INSERT INTO orders.order_statuses (name, color) 
       VALUES ('Completado', '#10B981') 
       RETURNING id`
    );
    
    return newStatusResult.rows[0].id;
  } catch (error) {
    console.error('Error obteniendo estado de orden válido:', error);
    throw error;
  }
}

export async function POST(request) {
  const dbClient = await pool.connect();

  try {
    const { 
      paymentIntentId, 
      orderId,
      items,
      amount,
      status = 'completed'
    } = await request.json();

    if (!paymentIntentId || !items || !amount) {
      return NextResponse.json({ 
        success: false, 
        message: 'Datos incompletos' 
      }, { status: 400 });
    }

    await dbClient.query('BEGIN');

    // Obtener un estado de orden válido
    const statusId = await getValidOrderStatusId(dbClient, 'Completado');
    
    console.log(`Usando estado de orden con ID: ${statusId}`);

    // Si no hay un orderId, creamos una nueva orden
    let orderIdToUse = orderId;
    
    if (!orderIdToUse) {
      // Generar número de orden
      const orderNumber = `FT-${Date.now()}`;
      
      // Calcular valores
      const subtotal = items.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.16; // 16% IVA
      const shippingCost = 0; // O el valor que corresponda
      
      // Insertar nueva orden
      const newOrderResult = await dbClient.query(
        `INSERT INTO orders.orders (
          order_number, user_id, status_id, subtotal, tax, shipping_cost, 
          total, payment_method, payment_status, created_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, CURRENT_TIMESTAMP) RETURNING id`,
        [
          orderNumber,
          items[0].user_id || null, // Si hay user_id en los items
          statusId,
          subtotal,
          tax,
          shippingCost,
          amount,
          'stripe',
          'paid',
        ]
      );
      
      orderIdToUse = newOrderResult.rows[0].id;
      
      // Insertar items de la orden con validación
      for (const item of items) {
        await dbClient.query(
          `INSERT INTO orders.order_items (
            order_id, product_id, variant_id, quantity, price, total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderIdToUse,
            item.product_id || item.id, // Compatibilidad con diferentes formatos
            item.variant_id || null,
            item.quantity,
            item.price,
            item.price * item.quantity
          ]
        );
      }
    } else {
      // Si ya existe la orden, actualizar su estado
      await dbClient.query(
        `UPDATE orders.orders 
         SET payment_status = 'paid', 
             status_id = $1,
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [statusId, orderIdToUse]
      );
    }
    
    // Actualizar inventario
    await updateInventory(items, dbClient);
    
    // Registrar la transacción
    await registerTransaction(orderIdToUse, paymentIntentId, amount, status, dbClient);

    await dbClient.query('COMMIT');

    return NextResponse.json({ 
      success: true, 
      message: 'Pago procesado y stock actualizado correctamente',
      orderId: orderIdToUse
    });

  } catch (error) {
    await dbClient.query('ROLLBACK');
    console.error('Error procesando pago:', error);
    return NextResponse.json({ 
      success: false, 
      message: 'Error al procesar el pago',
      error: error.message
    }, { status: 500 });
  } finally {
    dbClient.release();
  }
}