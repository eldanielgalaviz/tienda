import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    // Consulta para obtener categorías principales activas
    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        parent_id
      FROM 
        products.categories
      WHERE 
        is_active = true
      ORDER BY 
        name ASC
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({ categories: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener categorías:', error);
    return NextResponse.json(
      { error: 'Error al obtener las categorías', details: error.message },
      { status: 500 }
    );
  }
}