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
    const limit = parseInt(searchParams.get('limit') || '8');
    
    // Consulta para obtener los productos más vendidos
    const query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.price,
        p.compare_at_price,
        b.name AS brand_name,
        b.slug AS brand_slug,
        (
          SELECT image_url 
          FROM products.product_images 
          WHERE product_id = p.id AND is_primary = true
          LIMIT 1
        ) AS image_url,
        COUNT(oi.id) AS sold_count,
        SUM(oi.quantity) AS sold_quantity
      FROM 
        products.products p
      LEFT JOIN
        products.brands b ON p.brand_id = b.id
      LEFT JOIN
        orders.order_items oi ON p.id = oi.product_id
      LEFT JOIN
        orders.orders o ON oi.order_id = o.id AND o.status_id IN (
          SELECT id FROM orders.order_statuses 
          WHERE name IN ('Completado', 'Entregado', 'Enviado')
        )
      WHERE 
        p.is_active = true
      GROUP BY 
        p.id, b.name, b.slug
      ORDER BY 
        sold_quantity DESC NULLS LAST,
        p.is_featured DESC,
        p.created_at DESC
      LIMIT $1
    `;
    
    const result = await pool.query(query, [limit]);
    
    // Formatear los datos
    const formattedProducts = result.rows.map(product => ({
      id: product.id,
      name: product.name,
      slug: product.slug,
      price: parseFloat(product.price),
      compareAtPrice: product.compare_at_price ? parseFloat(product.compare_at_price) : null,
      brand: product.brand_name || 'Sin marca',
      brandSlug: product.brand_slug,
      image: product.image_url || "/placeholder.jpg",
      soldCount: parseInt(product.sold_count) || 0
    }));

    return NextResponse.json({ products: formattedProducts }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener productos más vendidos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos más vendidos', details: error.message },
      { status: 500 }
    );
  }
}