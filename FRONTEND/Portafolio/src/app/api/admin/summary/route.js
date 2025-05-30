import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    // Consulta para obtener el total de ventas
    const salesQuery = `
      SELECT 
        COALESCE(SUM(total), 0) as total_sales
      FROM 
        orders.orders
      WHERE 
        status_id IN (
          SELECT id FROM orders.order_statuses 
          WHERE name IN ('Completado', 'Entregado', 'Enviado')
        )
    `;

    // Consulta para obtener el número total de pedidos
    const ordersQuery = `
      SELECT 
        COUNT(*) as total_orders
      FROM 
        orders.orders
    `;

    // Consulta para obtener el número total de clientes
    const customersQuery = `
      SELECT 
        COUNT(*) as total_customers
      FROM 
        auth.users
      WHERE 
        is_admin = FALSE
    `;

    // Consulta para obtener el número total de productos
    const productsQuery = `
      SELECT 
        COUNT(*) as total_products
      FROM 
        products.products
      WHERE 
        is_active = TRUE
    `;

    // Ejecutar todas las consultas en paralelo
    const [salesResult, ordersResult, customersResult, productsResult] = await Promise.all([
      pool.query(salesQuery),
      pool.query(ordersQuery),
      pool.query(customersQuery),
      pool.query(productsQuery)
    ]);

    // Extraer los resultados
    const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0;
    const totalOrders = parseInt(ordersResult.rows[0].total_orders) || 0;
    const totalCustomers = parseInt(customersResult.rows[0].total_customers) || 0;
    const totalProducts = parseInt(productsResult.rows[0].total_products) || 0;

    // Consulta para obtener los productos más vendidos
    const topProductsQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        COUNT(oi.id) as order_count,
        SUM(oi.quantity) as total_sold
      FROM 
        products.products p
      JOIN 
        orders.order_items oi ON p.id = oi.product_id
      GROUP BY 
        p.id
      ORDER BY 
        total_sold DESC
      LIMIT 5
    `;

    // Consulta para obtener los últimos pedidos
    const recentOrdersQuery = `
      SELECT 
        o.id,
        o.order_number,
        o.created_at,
        o.total,
        os.name as status,
        u.first_name || ' ' || u.last_name as customer_name
      FROM 
        orders.orders o
      JOIN 
        orders.order_statuses os ON o.status_id = os.id
      JOIN 
        auth.users u ON o.user_id = u.id
      ORDER BY 
        o.created_at DESC
      LIMIT 5
    `;

    const [topProductsResult, recentOrdersResult] = await Promise.all([
      pool.query(topProductsQuery),
      pool.query(recentOrdersQuery)
    ]);

    // Preparar y devolver la respuesta
    return NextResponse.json({
      totalSales,
      totalOrders,
      totalCustomers,
      totalProducts,
      topProducts: topProductsResult.rows,
      recentOrders: recentOrdersResult.rows
    });
  } catch (error) {
    console.error('Error obteniendo datos de resumen:', error);
    return NextResponse.json(
      { error: 'Error al obtener datos de resumen', details: error.message },
      { status: 500 }
    );
  }
}