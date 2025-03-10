import { NextResponse } from 'next/server';
import { Pool } from 'pg';

// Configuración de la conexión a la base de datos usando DATABASE_URL
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    // Consulta para obtener marcas activas
    const query = `
      SELECT 
        id,
        name,
        slug,
        description,
        logo_url
      FROM 
        products.brands
      WHERE 
        is_active = true
      ORDER BY 
        name ASC
    `;

    const result = await pool.query(query);
    
    return NextResponse.json({ brands: result.rows }, { status: 200 });
  } catch (error) {
    console.error('Error al obtener marcas:', error);
    return NextResponse.json(
      { error: 'Error al obtener las marcas', details: error.message },
      { status: 500 }
    );
  }
}