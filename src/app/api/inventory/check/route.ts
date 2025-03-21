import { NextResponse } from 'next/server';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Función para verificar el stock y ocultar productos
async function checkStockAndHideProducts() {
  const client = await pool.connect();
  try {
    await client.query('BEGIN');

    // Consulta para obtener productos con stock en 0
    const productsWithZeroStock = await client.query(
      `SELECT id FROM products.products WHERE stock_quantity = 0 AND is_active = true`
    );

    // Si hay productos con stock en 0, actualiza su estado a oculto (is_active = false)
    if (productsWithZeroStock.rows.length > 0) {
      const productIds = productsWithZeroStock.rows.map(row => row.id);
      await client.query(
        `UPDATE products.products 
         SET is_active = false, updated_at = CURRENT_TIMESTAMP
         WHERE id = ANY($1::uuid[])`,
        [productIds]
      );
    }

    await client.query('COMMIT');
    return { success: true, hiddenProducts: productsWithZeroStock.rows.length };
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

export async function POST(request) {
  try {
    const { items } = await request.json();

    const client = await pool.connect();
    try {
      await client.query('BEGIN');

      // Actualizar el stock de cada producto o variante
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
      await checkStockAndHideProducts();

      await client.query('COMMIT');
      return NextResponse.json({ success: true }, { status: 200 });
    } catch (error) {
      await client.query('ROLLBACK');
      console.error('Error al actualizar el inventario:', error);
      return NextResponse.json(
        { success: false, message: 'Error al actualizar el inventario' },
        { status: 500 }
      );
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al procesar la solicitud:', error);
    return NextResponse.json(
      { success: false, message: 'Error al procesar la solicitud' },
      { status: 500 }
    );
  }
}