import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { Pool } from 'pg';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

export async function GET() {
  try {
    // Obtener el token JWT desde las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Opcional: verificar que el usuario todavía existe en la base de datos
    const result = await pool.query(
      `SELECT id, email, first_name, last_name, is_admin 
       FROM auth.users 
       WHERE id = $1`,
      [decoded.userId]
    );
    
    if (result.rows.length === 0) {
      return NextResponse.json({ user: null }, { status: 401 });
    }
    
    // Devolver los datos del usuario
    const user = result.rows[0];
    return NextResponse.json({
      id: user.id,
      email: user.email,
      firstName: user.first_name,
      lastName: user.last_name,
      isAdmin: user.is_admin
    });
  } catch (error) {
    console.error('Error al verificar usuario:', error);
    return NextResponse.json(
      { success: false, message: 'Error al verificar usuario' },
      { status: 401 }
    );
  }
}