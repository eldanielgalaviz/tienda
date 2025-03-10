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
    const customerId = searchParams.get('id');

    // Si se proporciona un ID de cliente, obtener los detalles de ese cliente
    if (customerId) {
      return getCustomerDetails(customerId);
    }
    
    // Si no se proporciona ID, obtener todos los clientes
    const query = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name AS name,
        u.email,
        u.phone,
        u.created_at,
        u.is_active,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(o.total), 0) AS total_spent,
        MAX(o.created_at) AS last_order_date
      FROM 
        auth.users u
      LEFT JOIN 
        orders.orders o ON u.id = o.user_id
      WHERE 
        u.is_admin = FALSE
      GROUP BY 
        u.id
      ORDER BY 
        u.created_at DESC
    `;

    const result = await pool.query(query);
    
    // Formatear los datos para que coincidan con el formato esperado por el componente
    const formattedCustomers = result.rows.map(customer => ({
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      orders: parseInt(customer.orders_count),
      totalSpent: parseFloat(customer.total_spent) || 0,
      lastOrder: customer.last_order_date ? customer.last_order_date.toISOString().split('T')[0] : '',
      status: customer.is_active ? 'active' : 'inactive',
      createdAt: customer.created_at
    }));

    return NextResponse.json({ customers: formattedCustomers }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener clientes:', error);
    return NextResponse.json(
      { error: 'Error al obtener los clientes', details: error.message },
      { status: 500 }
    );
  }
}

// Función para obtener los detalles de un cliente específico
async function getCustomerDetails(id) {
  try {
    // Verificar que el ID es un UUID válido
    if (!id.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      return NextResponse.json({ error: 'ID de cliente inválido' }, { status: 400 });
    }

    // Consulta para obtener datos del cliente
    const customerQuery = `
      SELECT 
        u.id,
        u.first_name || ' ' || u.last_name AS name,
        u.email,
        u.phone,
        u.created_at,
        u.last_login,
        u.is_active,
        COUNT(DISTINCT o.id) AS orders_count,
        COALESCE(SUM(o.total), 0) AS total_spent,
        MAX(o.created_at) AS last_order_date
      FROM 
        auth.users u
      LEFT JOIN 
        orders.orders o ON u.id = o.user_id
      WHERE 
        u.id = $1
      GROUP BY 
        u.id
    `;

    const customerResult = await pool.query(customerQuery, [id]);
    
    if (customerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Cliente no encontrado' }, { status: 404 });
    }

    const customer = customerResult.rows[0];

    // Consulta para obtener direcciones del cliente
    const addressesQuery = `
      SELECT 
        id,
        address_line1,
        address_line2,
        city,
        state,
        postal_code,
        country,
        is_default
      FROM 
        auth.addresses
      WHERE 
        user_id = $1
      ORDER BY 
        is_default DESC, created_at ASC
    `;

    const addressesResult = await pool.query(addressesQuery, [id]);

    // Consulta para obtener los últimos pedidos del cliente
    const ordersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.created_at,
        o.total,
        os.name AS status,
        os.color
      FROM 
        orders.orders o
      JOIN 
        orders.order_statuses os ON o.status_id = os.id
      WHERE 
        o.user_id = $1
      ORDER BY 
        o.created_at DESC
      LIMIT 5
    `;

    const ordersResult = await pool.query(ordersQuery, [id]);

    // Formatear la respuesta
    const customerDetail = {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      phone: customer.phone || '',
      orders: parseInt(customer.orders_count),
      totalSpent: parseFloat(customer.total_spent) || 0,
      lastOrder: customer.last_order_date ? customer.last_order_date.toISOString().split('T')[0] : '',
      status: customer.is_active ? 'active' : 'inactive',
      createdAt: customer.created_at,
      addresses: addressesResult.rows,
      recentOrders: ordersResult.rows.map(order => ({
        id: order.id,
        orderNumber: order.order_number,
        date: order.created_at,
        status: order.status,
        statusColor: order.color,
        total: parseFloat(order.total)
      }))
    };

    return NextResponse.json({ customer: customerDetail }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener detalles del cliente:', error);
    return NextResponse.json(
      { error: 'Error al obtener detalles del cliente', details: error.message },
      { status: 500 }
    );
  }
}