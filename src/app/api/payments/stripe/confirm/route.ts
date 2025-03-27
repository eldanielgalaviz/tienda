// src/app/api/payments/stripe/confirm/route.ts

import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Función para obtener el usuario actual a partir del token JWT
async function getCurrentUser() {
  try {
    // Usar await con cookies() para evitar el error
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      console.log("No se encontró token de autenticación");
      return null;
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Verificar que el usuario existe en la base de datos
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_admin 
       FROM auth.users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      console.log(`Usuario con ID ${decoded.userId} no encontrado en la base de datos`);
      return null;
    }
    
    // Devolver los datos del usuario
    console.log(`Usuario encontrado: ${result.rows[0].first_name} ${result.rows[0].last_name} (${result.rows[0].id})`);
    return result.rows[0];
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return null;
  }
}

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

// Función para obtener o crear un estado de orden
async function getOrCreateOrderStatus(client) {
  try {
    // Intentar obtener un estado completado/pagado existente
    const statusQuery = `
      SELECT id FROM orders.order_statuses 
      WHERE LOWER(name) IN ('completado', 'completed', 'pagado', 'paid')
      LIMIT 1
    `;
    
    const statusResult = await client.query(statusQuery);
    
    if (statusResult.rows.length > 0) {
      const statusId = statusResult.rows[0].id;
      console.log(`Estado de orden encontrado: ${statusId}`);
      return statusId;
    }
    
    console.log("No se encontró estado de orden. Creando nuevo estado 'Completado'");
    
    // Si no existe, crear un nuevo estado
    const newStatusQuery = `
      INSERT INTO orders.order_statuses (name, description, color, is_active)
      VALUES ('Completado', 'Pedido completado y pagado', '#10B981', true)
      RETURNING id
    `;
    
    const newStatusResult = await client.query(newStatusQuery);
    const newStatusId = newStatusResult.rows[0].id;
    
    console.log(`Nuevo estado de orden creado: ${newStatusId}`);
    return newStatusId;
  } catch (error) {
    console.error('Error al obtener/crear estado de orden:', error);
    throw error;
  }
}

export async function POST(request) {
  const dbClient = await pool.connect();

  try {
    // Obtener el usuario actual
    const currentUser = await getCurrentUser();
    console.log("Usuario actual:", currentUser?.id || "No autenticado");

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

    // Obtener o crear estado de orden
    const statusId = await getOrCreateOrderStatus(dbClient);

    // Si no hay un orderId, creamos una nueva orden
    let orderIdToUse = orderId;
    
    if (!orderIdToUse) {
      // Generar número de orden
      const orderNumber = `FT-${Date.now()}`;
      
      // Calcular subtotal, impuestos, etc.
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
          currentUser?.id, // Usamos el ID del usuario autenticado
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
      console.log(`Nueva orden creada: ${orderIdToUse}`);
      
      // Insertar items de la orden
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
             user_id = COALESCE(user_id, $2), -- Actualizar user_id solo si es NULL
             updated_at = CURRENT_TIMESTAMP
         WHERE id = $3`,
        [statusId, currentUser?.id, orderIdToUse]
      );
      
      console.log(`Orden existente actualizada: ${orderIdToUse}`);
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