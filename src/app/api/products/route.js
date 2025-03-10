import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET(request) {
  try {
    // Obtener parámetros de consulta
    const { searchParams } = new URL(request.url);
    const all = searchParams.get('all') === 'true';
    const limit = parseInt(searchParams.get('limit') || '0');
    const category = searchParams.get('category');
    const brand = searchParams.get('brand');
    const id = searchParams.get('id');
    const isAdmin = searchParams.get('admin') === 'true';
    
    // Si se solicita un producto específico por ID
    if (id) {
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
          p.id = $1
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
      
      // Ejecutar consultas en paralelo
      const [productResult, imagesResult] = await Promise.all([
        pool.query(productQuery, [id]),
        pool.query(imagesQuery, [id])
      ]);
      
      if (productResult.rows.length === 0) {
        return NextResponse.json({ error: 'Producto no encontrado' }, { status: 404 });
      }
      
      const product = productResult.rows[0];
      product.images = imagesResult.rows;
      
      return NextResponse.json({ product }, { status: 200 });
    }
    
    // Construir la consulta base para listar productos
    let query = `
      SELECT 
        p.id,
        p.name,
        p.slug,
        p.description,
        p.price,
        p.compare_at_price,
        p.sku,
        p.stock_quantity as stock,
        p.is_featured,
        p.is_active,
        p.created_at,
        c.id as category_id,
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
        END as status,
        (
          SELECT image_url 
          FROM products.product_images 
          WHERE product_id = p.id AND is_primary = true
          LIMIT 1
        ) as image_url
      FROM 
        products.products p
      LEFT JOIN 
        products.categories c ON p.main_category_id = c.id
      LEFT JOIN 
        products.brands b ON p.brand_id = b.id
      WHERE 1=1
    `;
    
    const queryParams = [];
    let paramIndex = 1;
    
    // Si no es una solicitud de admin, mostrar solo productos activos
    if (!isAdmin) {
      query += ` AND p.is_active = true`;
    }
    
    // Filtrar por categoría si se proporciona
    if (category) {
      query += ` AND c.slug = $${paramIndex}`;
      queryParams.push(category);
      paramIndex++;
    }
    
    // Filtrar por marca si se proporciona
    if (brand) {
      query += ` AND b.slug = $${paramIndex}`;
      queryParams.push(brand);
      paramIndex++;
    }
    
    // Orden por defecto
    query += `
      ORDER BY 
        p.is_active DESC,
        p.is_featured DESC,
        p.created_at DESC
    `;
    
    // Limitar resultados si se solicita
    if (!all && limit > 0) {
      query += ` LIMIT $${paramIndex}`;
      queryParams.push(limit);
    }

    const result = await pool.query(query, queryParams);
    
    return NextResponse.json({ products: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener productos:', error);
    return NextResponse.json(
      { error: 'Error al obtener los productos', details: error.message },
      { status: 500 }
    );
  }
}

// Función para manejar la creación de nuevos productos
export async function POST(request) {
  try {
    const formData = await request.formData();
    
    // Extrae datos del formulario
    const name = formData.get('name');
    const sku = formData.get('sku');
    const price = formData.get('price');
    const categoryId = formData.get('category');
    const stock = formData.get('stock');
    const description = formData.get('description');
    const imageFile = formData.get('image');
    
    // Genera un slug a partir del nombre
    const slug = name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Conecta al pool de base de datos
    const client = await pool.connect();
    
    try {
      // Comienza una transacción
      await client.query('BEGIN');
      
      // Inserta el nuevo producto
      const productResult = await client.query(
        `INSERT INTO products.products (
          name, slug, description, price, sku, stock_quantity, main_category_id, is_active
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8) RETURNING id`,
        [name, slug, description, parseFloat(price), sku, parseInt(stock), categoryId, true]
      );
      
      const productId = productResult.rows[0].id;
      
      // Procesa la imagen si existe
      if (imageFile && imageFile.size > 0) {
        // Define la ruta para guardar la imagen
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        
        // Asegura que el directorio exista
        try {
          await mkdir(uploadsDir, { recursive: true });
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
        
        // Genera un nombre único para la imagen
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Convierte el archivo a un buffer para guardarlo
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Guarda el archivo en el sistema
        await writeFile(filePath, buffer);
        
        // URL relativa para la base de datos
        const imageUrl = `/uploads/products/${fileName}`;
        
        // Guarda la referencia de la imagen en la base de datos
        await client.query(
          `INSERT INTO products.product_images (
            product_id, image_url, alt_text, is_primary
          ) VALUES ($1, $2, $3, $4)`,
          [productId, imageUrl, name, true]
        );
      }
      
      // Asocia el producto con la categoría (además de la categoría principal)
      await client.query(
        `INSERT INTO products.product_categories (
          product_id, category_id
        ) VALUES ($1, $2)`,
        [productId, categoryId]
      );
      
      // Confirma la transacción
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        product: {
          id: productId,
          name,
          slug,
          sku,
          price
        } 
      }, { status: 201 });
      
    } catch (error) {
      // Revierte la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Libera el cliente
      client.release();
    }
    
  } catch (error) {
    console.error('Error al crear producto:', error);
    return NextResponse.json(
      { error: 'Error al crear el producto', details: error.message },
      { status: 500 }
    );
  }
}

// Función para manejar la actualización de productos
export async function PUT(request) {
  try {
    const formData = await request.formData();
    
    // Extrae datos del formulario
    const id = formData.get('id');
    const name = formData.get('name');
    const sku = formData.get('sku');
    const price = formData.get('price');
    const categoryId = formData.get('category');
    const stock = formData.get('stock');
    const description = formData.get('description');
    const imageFile = formData.get('image');
    const isActive = formData.get('is_active') === 'true'; // Nuevo campo para activar/desactivar
    
    // Verifica que se proporciona un ID
    if (!id) {
      return NextResponse.json({ error: 'Se requiere ID de producto' }, { status: 400 });
    }
    
    // Genera un slug a partir del nombre (si el nombre ha cambiado)
    const slug = name.toLowerCase()
      .replace(/[^\w\s]/gi, '')
      .replace(/\s+/g, '-');
    
    // Conecta al pool de base de datos
    const client = await pool.connect();
    
    try {
      // Comienza una transacción
      await client.query('BEGIN');
      
      // Actualiza el producto
      await client.query(
        `UPDATE products.products SET
          name = $1,
          slug = $2,
          description = $3,
          price = $4,
          sku = $5,
          stock_quantity = $6,
          main_category_id = $7,
          is_active = $8,
          updated_at = CURRENT_TIMESTAMP
        WHERE id = $9`,
        [name, slug, description, parseFloat(price), sku, parseInt(stock), categoryId, isActive, id]
      );
      
      // Procesa la imagen si existe una nueva
      if (imageFile && imageFile.size > 0) {
        // Define la ruta para guardar la imagen
        const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'products');
        
        // Asegura que el directorio exista
        try {
          await mkdir(uploadsDir, { recursive: true });
        } catch (err) {
          if (err.code !== 'EEXIST') {
            throw err;
          }
        }
        
        // Genera un nombre único para la imagen
        const fileExtension = imageFile.name.split('.').pop().toLowerCase();
        const fileName = `${uuidv4()}.${fileExtension}`;
        const filePath = path.join(uploadsDir, fileName);
        
        // Convierte el archivo a un buffer para guardarlo
        const arrayBuffer = await imageFile.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);
        
        // Guarda el archivo en el sistema
        await writeFile(filePath, buffer);
        
        // URL relativa para la base de datos
        const imageUrl = `/uploads/products/${fileName}`;
        
        // Actualiza las imágenes existentes como no primarias
        await client.query(
          `UPDATE products.product_images
           SET is_primary = false
           WHERE product_id = $1`,
          [id]
        );
        
        // Guarda la referencia de la nueva imagen en la base de datos
        await client.query(
          `INSERT INTO products.product_images (
            product_id, image_url, alt_text, is_primary
          ) VALUES ($1, $2, $3, $4)`,
          [id, imageUrl, name, true]
        );
      }
      
      // Actualiza la relación con la categoría
      // Primero elimina las existentes
      await client.query(
        `DELETE FROM products.product_categories WHERE product_id = $1`,
        [id]
      );
      
      // Luego agrega la nueva
      await client.query(
        `INSERT INTO products.product_categories (
          product_id, category_id
        ) VALUES ($1, $2)`,
        [id, categoryId]
      );
      
      // Confirma la transacción
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true, 
        product: {
          id,
          name,
          slug,
          sku,
          price,
          is_active: isActive
        } 
      }, { status: 200 });
      
    } catch (error) {
      // Revierte la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Libera el cliente
      client.release();
    }
    
  } catch (error) {
    console.error('Error al actualizar producto:', error);
    return NextResponse.json(
      { error: 'Error al actualizar el producto', details: error.message },
      { status: 500 }
    );
  }
}

// Función para manejar la activación/desactivación de productos
// Función para manejar la activación/desactivación de productos
export async function PATCH(request) {
  try {
    const data = await request.json();
    const id = data.id;
    const isActive = data.isActive;
    
    console.log("API: Cambiando producto ID:", id);
    console.log("API: Nuevo estado isActive:", isActive);
    
    if (!id) {
      return NextResponse.json({ error: 'Se requiere ID de producto' }, { status: 400 });
    }
    
    // Conecta al pool de base de datos
    const client = await pool.connect();
    
    try {
      // Actualiza el estado del producto
      await client.query(
        `UPDATE products.products 
         SET is_active = $1, updated_at = CURRENT_TIMESTAMP
         WHERE id = $2`,
        [isActive, id]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: isActive ? 'Producto activado correctamente' : 'Producto desactivado correctamente',
        is_active: isActive
      }, { status: 200 });
      
    } catch (error) {
      throw error;
    } finally {
      // Libera el cliente
      client.release();
    }
    
  } catch (error) {
    console.error('Error al cambiar estado del producto:', error);
    return NextResponse.json(
      { error: 'Error al cambiar estado del producto', details: error.message },
      { status: 500 }
    );
  }
}

// La función DELETE sigue funcionando para compatibilidad, pero ahora es redundante
// ya que usamos PATCH para cambiar el estado
export async function DELETE(request) {
  try {
    // Obtener el ID del producto de la URL
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Se requiere ID de producto' }, { status: 400 });
    }
    
    // Conecta al pool de base de datos
    const client = await pool.connect();
    
    try {
      // Desactiva el producto en lugar de eliminarlo
      await client.query(
        `UPDATE products.products 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [id]
      );
      
      return NextResponse.json({ 
        success: true, 
        message: 'Producto desactivado correctamente' 
      }, { status: 200 });
      
    } catch (error) {
      throw error;
    } finally {
      // Libera el cliente
      client.release();
    }
    
  } catch (error) {
    console.error('Error al desactivar producto:', error);
    return NextResponse.json(
      { error: 'Error al desactivar el producto', details: error.message },
      { status: 500 }
    );
  }
}