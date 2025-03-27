// src/app/api/orders/route.js

import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(request) {
  try {
    // Obtener los parámetros de la URL
    const { searchParams } = new URL(request.url);
    const orderId = searchParams.get('id');
    const limit = parseInt(searchParams.get('limit') || '100'); // Aumentamos el límite por defecto

    // Si se proporciona un ID de pedido, obtener los detalles de ese pedido
    if (orderId) {
      return getOrderDetails(orderId);
    }
    
    // Si no se proporciona ID, obtener todos los pedidos
    // También se puede filtrar por estado si se proporciona el parámetro "status"
    const status = searchParams.get('status');
    
    let query = `
      SELECT 
        o.id,
        o.order_number,
        o.created_at,
        CASE
          WHEN u.id IS NOT NULL THEN u.first_name || ' ' || u.last_name
          ELSE 'Cliente sin cuenta'
        END AS customer_name,
        COALESCE(u.email, 'Sin email') AS customer_email,
        o.total,
        os.name AS status,
        os.color AS status_color,
        o.payment_method,
        o.payment_status,
        o.user_id -- Incluir user_id para diagnóstico
      FROM 
        orders.orders o
      LEFT JOIN 
        auth.users u ON o.user_id = u.id
      LEFT JOIN 
        orders.order_statuses os ON o.status_id = os.id
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Añadir filtro de estado si se proporciona
    if (status && status !== 'all') {
      query += ` WHERE LOWER(os.name) = LOWER($${paramIndex})`;
      queryParams.push(status);
      paramIndex++;
    }
    
    // Ordenar por fecha de creación (más recientes primero)
    query += ` ORDER BY o.created_at DESC`;
    
    // Limitar el número de resultados si se especifica
    if (limit > 0) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
    }
    
    console.log("Ejecutando consulta de pedidos:", query);
    console.log("Parámetros:", queryParams);
    
    const result = await pool.query(query, queryParams);
    
    console.log(`Encontrados ${result.rows.length} pedidos`);
    
    // Log para diagnóstico: verificar cuántos pedidos tienen user_id NULL
    const ordersWithoutUserId = result.rows.filter(order => !order.user_id).length;
    console.log(`Pedidos sin user_id: ${ordersWithoutUserId} de ${result.rows.length}`);
    
    // Formatear los datos para que coincidan con el formato esperado por el componente
    const formattedOrders = result.rows.map(order => ({
      id: order.order_number || order.id,
      date: order.created_at,
      customer: order.customer_name,
      email: order.customer_email,
      total: parseFloat(order.total),
      status: order.status?.toLowerCase() || 'pendiente',
      statusColor: order.status_color,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      orderId: order.id, // ID real en la base de datos (UUID)
      hasUser: !!order.user_id // Indicador para diagnóstico
    }));

    return NextResponse.json({ orders: formattedOrders }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener pedidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los pedidos', details: error.message },
      { status: 500 }
    );
  }
}

// Función para obtener los detalles de un pedido específico
async function getOrderDetails(id) {
  try {
    console.log("Obteniendo detalles del pedido con ID:", id);
    
    // Verificar si el ID podría ser un UUID
    const isUuidPattern = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    const isUuid = isUuidPattern.test(id);
    
    console.log("¿El ID parece un UUID?", isUuid);
    
    // Primero obtenemos la información básica del pedido
    // Modificamos la consulta para manejar tanto UUIDs como strings
    const orderQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.created_at,
        o.subtotal,
        o.tax,
        o.shipping_cost,
        o.discount,
        o.total,
        o.payment_method,
        o.payment_status,
        o.shipping_method,
        o.tracking_number,
        o.notes,
        o.completed_at,
        o.cancelled_at,
        o.cancellation_reason,
        o.user_id,
        os.name AS status,
        os.color AS status_color,
        CASE
          WHEN u.id IS NOT NULL THEN u.first_name || ' ' || u.last_name
          ELSE 'Cliente sin cuenta'
        END AS customer_name,
        COALESCE(u.email, 'Sin email') AS customer_email,
        u.phone AS customer_phone
      FROM 
        orders.orders o
      LEFT JOIN 
        orders.order_statuses os ON o.status_id = os.id
      LEFT JOIN 
        auth.users u ON o.user_id = u.id
      WHERE 
        ${isUuid ? 'o.id = $1::uuid' : 'o.order_number = $1'}
    `;

    console.log("Consulta de pedido:", orderQuery.replace(/\s+/g, ' '));
    
    const orderResult = await pool.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      console.log("No se encontró ningún pedido con ID:", id);
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const order = orderResult.rows[0];
    console.log("Pedido encontrado:", order.id, order.order_number, "User ID:", order.user_id);

    // Obtenemos los productos incluidos en el pedido
    const orderItemsQuery = `
      SELECT 
        oi.id,
        oi.quantity,
        oi.price,
        oi.discount,
        oi.total,
        p.name AS product_name,
        p.slug AS product_slug,
        pv.id AS variant_id,
        (
          SELECT string_agg(av.display_value, ', ')
          FROM products.variant_attribute_values vav
          JOIN products.attribute_values av ON vav.attribute_value_id = av.id
          WHERE vav.variant_id = pv.id
        ) AS variant_details,
        (
          SELECT image_url
          FROM products.product_images
          WHERE product_id = p.id AND is_primary = true
          LIMIT 1
        ) AS product_image
      FROM 
        orders.order_items oi
      LEFT JOIN 
        products.products p ON oi.product_id = p.id
      LEFT JOIN 
        products.product_variants pv ON oi.variant_id = pv.id
      WHERE 
        oi.order_id = $1::uuid
      ORDER BY 
        oi.created_at
    `;

    const orderItemsResult = await pool.query(orderItemsQuery, [order.id]);
    console.log(`Encontrados ${orderItemsResult.rows.length} productos en el pedido`);

    // Obtenemos la dirección de envío
    const addressQuery = `
      SELECT 
        a.address_line1,
        a.address_line2,
        a.city,
        a.state,
        a.postal_code,
        a.country
      FROM 
        auth.addresses a
      WHERE 
        a.id = $1::uuid
    `;

    let shippingAddress = null;
    if (order.shipping_address_id) {
      const addressResult = await pool.query(addressQuery, [order.shipping_address_id]);
      if (addressResult.rows.length > 0) {
        shippingAddress = addressResult.rows[0];
      }
    }

    // Formatear la respuesta
    const orderDetail = {
      id: order.order_number || order.id,
      realId: order.id,
      date: order.created_at,
      customer: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      subtotal: parseFloat(order.subtotal || 0),
      tax: parseFloat(order.tax || 0),
      shipping: parseFloat(order.shipping_cost || 0),
      discount: parseFloat(order.discount || 0),
      total: parseFloat(order.total || 0),
      status: (order.status || 'pendiente').toLowerCase(),
      statusColor: order.status_color,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingMethod: order.shipping_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      completedAt: order.completed_at,
      cancelledAt: order.cancelled_at,
      cancellationReason: order.cancellation_reason,
      userId: order.user_id, // Incluir para diagnóstico
      items: orderItemsResult.rows.map(item => ({
        id: item.id,
        productName: item.product_name || 'Producto desconocido',
        productSlug: item.product_slug,
        variantDetails: item.variant_details,
        image: item.product_image,
        price: parseFloat(item.price || 0),
        quantity: parseInt(item.quantity || 0),
        discount: parseFloat(item.discount || 0),
        total: parseFloat(item.total || 0)
      })),
      shippingAddress: shippingAddress
    };

    return NextResponse.json({ order: orderDetail }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener detalles del pedido:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles del pedido', details: error.message },
      { status: 500 }
    );
  }
}