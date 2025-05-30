// src/app/api/orders/route.ts

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
        u.first_name || ' ' || u.last_name AS customer_name,
        u.email AS customer_email,
        o.total,
        os.name AS status,
        os.color AS status_color,
        o.payment_method
      FROM 
        orders.orders o
      JOIN 
        auth.users u ON o.user_id = u.id
      JOIN 
        orders.order_statuses os ON o.status_id = os.id
    `;
    
    const queryParams = [];
    
    // Añadir filtro de estado si se proporciona
    if (status && status !== 'all') {
      query += ` WHERE os.name = $1`;
      queryParams.push(status);
    }
    
    query += ` ORDER BY o.created_at DESC`;
    
    const result = await pool.query(query, queryParams);
    
    // Formatear los datos para que coincidan con el formato esperado por el componente
    const formattedOrders = result.rows.map(order => ({
      id: order.order_number,
      date: order.created_at.toISOString().split('T')[0],
      customer: order.customer_name,
      email: order.customer_email,
      total: parseFloat(order.total),
      status: order.status.toLowerCase(),
      statusColor: order.status_color,
      paymentMethod: order.payment_method,
      orderId: order.id // ID real en la base de datos (UUID)
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
    // Primero obtenemos la información básica del pedido
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
        os.name AS status,
        os.color AS status_color,
        u.first_name || ' ' || u.last_name AS customer_name,
        u.email AS customer_email,
        u.phone AS customer_phone
      FROM 
        orders.orders o
      JOIN 
        orders.order_statuses os ON o.status_id = os.id
      JOIN 
        auth.users u ON o.user_id = u.id
      WHERE 
        o.id = $1 OR o.order_number = $1
    `;

    const orderResult = await pool.query(orderQuery, [id]);
    
    if (orderResult.rows.length === 0) {
      return NextResponse.json({ error: 'Pedido no encontrado' }, { status: 404 });
    }

    const order = orderResult.rows[0];

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
      JOIN 
        products.products p ON oi.product_id = p.id
      LEFT JOIN 
        products.product_variants pv ON oi.variant_id = pv.id
      WHERE 
        oi.order_id = $1
      ORDER BY 
        oi.created_at
    `;

    const orderItemsResult = await pool.query(orderItemsQuery, [order.id]);

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
        a.id = $1
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
      id: order.order_number,
      realId: order.id,
      date: order.created_at,
      customer: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      subtotal: parseFloat(order.subtotal),
      tax: parseFloat(order.tax),
      shipping: parseFloat(order.shipping_cost),
      discount: parseFloat(order.discount),
      total: parseFloat(order.total),
      status: order.status.toLowerCase(),
      statusColor: order.status_color,
      paymentMethod: order.payment_method,
      paymentStatus: order.payment_status,
      shippingMethod: order.shipping_method,
      trackingNumber: order.tracking_number,
      notes: order.notes,
      completedAt: order.completed_at,
      items: orderItemsResult.rows.map(item => ({
        id: item.id,
        productName: item.product_name,
        productSlug: item.product_slug,
        variantDetails: item.variant_details,
        image: item.product_image,
        price: parseFloat(item.price),
        quantity: parseInt(item.quantity),
        discount: parseFloat(item.discount),
        total: parseFloat(item.total)
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