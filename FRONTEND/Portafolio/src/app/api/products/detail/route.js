import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(request) {
  try {
    // Obtener el slug de la URL
    const { searchParams } = new URL(request.url);
    const slug = searchParams.get('slug');
    
    if (!slug) {
      return NextResponse.json({ error: 'Se requiere un slug de producto' }, { status: 400 });
    }
    
    // Consulta para obtener los detalles del producto por slug
    const productQuery = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_at_price,
        p.cost_price,
        p.sku,
        p.barcode,
        p.stock_quantity as stock,
        p.is_featured,
        p.is_active,
        p.created_at,
        p.main_category_id,
        c.name as category_name,
        c.slug as category_slug,
        b.id as brand_id,
        b.name as brand_name,
        b.slug as brand_slug,
        CASE
          WHEN p.stock_quantity = 0 THEN 'out_of_stock'
          WHEN p.stock_quantity < 10 THEN 'low_stock'
          WHEN p.is_active = false THEN 'inactive'
          ELSE 'active'
        END as status
      FROM 
        products.products p
      LEFT JOIN 
        products.categories c ON p.main_category_id = c.id
      LEFT JOIN 
        products.brands b ON p.brand_id = b.id
      WHERE 
        p.slug = $1 AND p.is_active = true
    `;
    
    const imagesQuery = `
      SELECT 
        id,
        image_url,
        alt_text,
        is_primary,
        sort_order
      FROM 
        products.product_images
      WHERE 
        product_id = $1
      ORDER BY 
        is_primary DESC, sort_order ASC
    `;
    
    // Ejecutar la consulta del producto
    const productResult = await pool.query(productQuery, [slug]);
    
    if (productResult.rows.length === 0) {
      return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
    }
    
    const product = productResult.rows[0];
    
    // Obtener las imágenes del producto
    const imagesResult = await pool.query(imagesQuery, [product.id]);
    product.images = imagesResult.rows;
    
    return NextResponse.json({ product }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener detalles del producto:', error);
    return NextResponse.json(
      { error: 'Error al obtener los detalles del producto', details: error.message },
      { status: 500 }
    );
  }
}