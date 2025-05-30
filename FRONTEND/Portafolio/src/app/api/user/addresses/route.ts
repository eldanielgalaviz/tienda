// src/app/api/user/addresses/route.ts
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import { Pool } from 'pg';
import { v4 as uuidv4 } from 'uuid';

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key-change-in-production";
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// GET: Obtener direcciones del usuario
export async function GET(request: Request) {
  try {
    // Obtener el token JWT desde las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Obtener userId de los parámetros de la URL (para admins que necesiten ver direcciones de otros usuarios)
    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get('userId');
    
    // Solo permitir que los admins vean direcciones de otros usuarios
    let userId = decoded.userId;
    if (requestedUserId && requestedUserId !== decoded.userId) {
      if (!decoded.isAdmin) {
        return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
      }
      userId = requestedUserId;
    }
    
    // Consultar las direcciones del usuario
    const query = `
      SELECT 
        id,
        user_id,
        address_line1 AS street,
        address_line2 AS apartment,
        neighborhood,
        city,
        state,
        postal_code AS "postalCode",
        country,
        is_default AS "isDefault",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
      FROM 
        auth.addresses
      WHERE 
        user_id = $1
      ORDER BY
        is_default DESC,
        created_at DESC
    `;
    
    const result = await pool.query(query, [userId]);
    
    // Crear objetos de dirección con campos adicionales para el frontend
    const addresses = result.rows.map(address => ({
      ...address,
      fullName: "Usuario", // Valor por defecto ya que no está en la tabla
      phone: "", // Valor por defecto ya que no está en la tabla
      neighborhood: address.neighborhood || '' // Puede ser null
    }));
    
    return NextResponse.json({ addresses });
  } catch (error) {
    console.error('Error al obtener direcciones:', error);
    return NextResponse.json(
      { error: 'Error al obtener direcciones' },
      { status: 500 }
    );
  }
}

// POST: Guardar nueva dirección de usuario
export async function POST(request: Request) {
  try {
    // Obtener el token JWT desde las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Obtener datos de la solicitud
    const { userId, address } = await request.json();
    
    // Solo permitir que los admins creen direcciones para otros usuarios
    if (userId !== decoded.userId && !decoded.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Validar campos obligatorios
    if (!address.street || !address.city || !address.state || !address.postalCode) {
      return NextResponse.json(
        { error: 'Todos los campos obligatorios deben estar completos' },
        { status: 400 }
      );
    }
    
    // Conectar al pool de la base de datos
    const client = await pool.connect();
    
    try {
      // Iniciar una transacción
      await client.query('BEGIN');
      
      // Comprobar si esta es la primera dirección del usuario
      const checkQuery = 'SELECT COUNT(*) FROM auth.addresses WHERE user_id = $1';
      const checkResult = await client.query(checkQuery, [userId]);
      const isFirstAddress = parseInt(checkResult.rows[0].count) === 0;
      
      // Si es la primera dirección, establecerla como predeterminada
      const isDefault = isFirstAddress;
      
      // Insertar la nueva dirección
      const query = `
        INSERT INTO auth.addresses (
          id,
          user_id,
          address_line1,
          address_line2,
          neighborhood,
          city,
          state,
          postal_code,
          country,
          is_default,
          created_at,
          updated_at
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, NOW(), NOW())
        RETURNING 
          id,
          address_line1 AS street,
          address_line2 AS apartment,
          neighborhood,
          city,
          state,
          postal_code AS "postalCode",
          country,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;
      
      const addressId = uuidv4();
      const values = [
        addressId,
        userId,
        address.street,
        address.apartment || null,
        address.neighborhood || null,
        address.city,
        address.state,
        address.postalCode,
        'México', // País por defecto
        isDefault
      ];
      
      const result = await client.query(query, values);
      
      // Si es la dirección predeterminada, asegurarse de que ninguna otra sea predeterminada
      if (isDefault) {
        const updateQuery = `
          UPDATE auth.addresses 
          SET is_default = false 
          WHERE user_id = $1 AND id != $2
        `;
        await client.query(updateQuery, [userId, addressId]);
      }
      
      // Confirmar la transacción
      await client.query('COMMIT');
      
      // Crear objeto de respuesta con los campos necesarios para el frontend
      const newAddress = {
        ...result.rows[0],
        fullName: address.fullName || "Usuario", // Añadir fullName porque no está en la tabla
        phone: address.phone || "", // Añadir phone porque no está en la tabla
        neighborhood: result.rows[0].neighborhood || '' // Puede ser null
      };
      
      // Devolver la dirección creada
      return NextResponse.json({ 
        message: 'Dirección guardada correctamente',
        address: newAddress
      });
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Liberar el cliente
      client.release();
    }
  } catch (error) {
    console.error('Error al guardar dirección:', error);
    return NextResponse.json(
      { error: 'Error al guardar la dirección' },
      { status: 500 }
    );
  }
}

// PUT: Actualizar una dirección existente o establecerla como predeterminada
export async function PUT(request: Request) {
  try {
    // Obtener el token JWT desde las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Obtener datos de la solicitud
    const data = await request.json();
    
    // Revisar si es una actualización de dirección o solo un cambio de estado predeterminado
    if (data.addressId && 'isDefault' in data && Object.keys(data).length === 2) {
      // Es solo un cambio de estado predeterminado
      return updateDefaultStatus(data.addressId, data.isDefault, decoded);
    } else {
      // Es una actualización completa de dirección
      return updateAddress(data, decoded);
    }
    
  } catch (error) {
    console.error('Error al actualizar dirección:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la dirección' },
      { status: 500 }
    );
  }
}

// Función auxiliar para actualizar el estado predeterminado
async function updateDefaultStatus(addressId: string, isDefault: boolean, decoded: any) {
  try {
    // Obtener el propietario de la dirección
    const ownerQuery = 'SELECT user_id FROM auth.addresses WHERE id = $1';
    const ownerResult = await pool.query(ownerQuery, [addressId]);
    
    if (ownerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
    }
    
    const addressOwnerId = ownerResult.rows[0].user_id;
    
    // Solo permitir que los propietarios o admins actualicen la dirección
    if (addressOwnerId !== decoded.userId && !decoded.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Conectar al pool de la base de datos
    const client = await pool.connect();
    
    try {
      // Iniciar una transacción
      await client.query('BEGIN');
      
      // Si estamos estableciendo esta dirección como predeterminada, primero quitamos ese estado de las demás
      if (isDefault) {
        const resetQuery = `
          UPDATE auth.addresses 
          SET is_default = false 
          WHERE user_id = $1
        `;
        await client.query(resetQuery, [addressOwnerId]);
      }
      
      // Actualizar la dirección
      const updateQuery = `
        UPDATE auth.addresses 
        SET 
          is_default = $1,
          updated_at = NOW()
        WHERE id = $2
        RETURNING 
          id,
          address_line1 AS street,
          address_line2 AS apartment,
          neighborhood,
          city,
          state,
          postal_code AS "postalCode",
          country,
          is_default AS "isDefault",
          created_at AS "createdAt",
          updated_at AS "updatedAt"
      `;
      
      const result = await client.query(updateQuery, [isDefault, addressId]);
      
      // Confirmar la transacción
      await client.query('COMMIT');
      
      // Crear objeto de respuesta con los campos necesarios para el frontend
      const updatedAddress = {
        ...result.rows[0],
        fullName: "Usuario", // Valor por defecto o buscar el nombre real
        phone: "", // Valor por defecto o buscar el teléfono real
        neighborhood: result.rows[0].neighborhood || '' // Puede ser null
      };
      
      // Devolver la dirección actualizada
      return NextResponse.json({ 
        message: 'Dirección actualizada correctamente',
        address: updatedAddress
      });
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Liberar el cliente
      client.release();
    }
  } catch (error) {
    console.error('Error al actualizar el estado predeterminado:', error);
    throw error;
  }
}

// Función auxiliar para actualizar una dirección completa
async function updateAddress(data: any, decoded: any) {
  // Extrae los datos relevantes
  const { addressId, userId, address } = data;
  
  if (!addressId) {
    return NextResponse.json(
      { error: 'Se requiere un ID de dirección para actualizarla' },
      { status: 400 }
    );
  }
  
  // Verificar si la dirección existe y si pertenece al usuario correcto
  const checkQuery = 'SELECT user_id FROM auth.addresses WHERE id = $1';
  const checkResult = await pool.query(checkQuery, [addressId]);
  
  if (checkResult.rows.length === 0) {
    return NextResponse.json(
      { error: 'La dirección no existe' },
      { status: 404 }
    );
  }
  
  const addressOwnerId = checkResult.rows[0].user_id;
  
  // Verificar permisos
  if (addressOwnerId !== decoded.userId && !decoded.isAdmin) {
    return NextResponse.json(
      { error: 'No tienes permiso para editar esta dirección' },
      { status: 403 }
    );
  }
  
  // Validar campos obligatorios
  if (!address.street || !address.city || !address.state || !address.postalCode) {
    return NextResponse.json(
      { error: 'Todos los campos obligatorios deben estar completos' },
      { status: 400 }
    );
  }
  
  // Conectar al pool de la base de datos
  const client = await pool.connect();
  
  try {
    // Iniciar una transacción
    await client.query('BEGIN');
    
    // Actualizar la dirección
    const updateQuery = `
      UPDATE auth.addresses
      SET
        address_line1 = $1,
        address_line2 = $2,
        neighborhood = $3,
        city = $4,
        state = $5,
        postal_code = $6,
        updated_at = NOW()
      WHERE id = $7
      RETURNING
        id,
        address_line1 AS street,
        address_line2 AS apartment,
        neighborhood,
        city,
        state,
        postal_code AS "postalCode",
        country,
        is_default AS "isDefault",
        created_at AS "createdAt",
        updated_at AS "updatedAt"
    `;
    
    const values = [
      address.street,
      address.apartment || null,
      address.neighborhood || null,
      address.city,
      address.state,
      address.postalCode,
      addressId
    ];
    
    const result = await client.query(updateQuery, values);
    
    // Confirmar la transacción
    await client.query('COMMIT');
    
    // Crear objeto de respuesta
    const updatedAddress = {
      ...result.rows[0],
      fullName: address.fullName || "Usuario",
      phone: address.phone || "",
      neighborhood: result.rows[0].neighborhood || '' // Puede ser null
    };
    
    return NextResponse.json({
      message: 'Dirección actualizada correctamente',
      address: updatedAddress
    });
    
  } catch (error) {
    // Revertir la transacción en caso de error
    await client.query('ROLLBACK');
    console.error('Error al actualizar la dirección:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la dirección' },
      { status: 500 }
    );
  } finally {
    client.release();
  }
}

// DELETE: Eliminar dirección
export async function DELETE(request: Request) {
  try {
    // Obtener el token JWT desde las cookies
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 401 });
    }
    
    // Verificar el token JWT
    const decoded = verify(token, JWT_SECRET) as {
      userId: string;
      email: string;
      isAdmin: boolean;
    };
    
    // Obtener addressId de la URL
    const { searchParams } = new URL(request.url);
    const addressId = searchParams.get('addressId');
    
    if (!addressId) {
      return NextResponse.json({ error: 'Se requiere ID de dirección' }, { status: 400 });
    }
    
    // Obtener el propietario de la dirección
    const ownerQuery = 'SELECT user_id, is_default FROM auth.addresses WHERE id = $1';
    const ownerResult = await pool.query(ownerQuery, [addressId]);
    
    if (ownerResult.rows.length === 0) {
      return NextResponse.json({ error: 'Dirección no encontrada' }, { status: 404 });
    }
    
    const addressOwnerId = ownerResult.rows[0].user_id;
    const isDefault = ownerResult.rows[0].is_default;
    
    // Solo permitir que los propietarios o admins eliminen la dirección
    if (addressOwnerId !== decoded.userId && !decoded.isAdmin) {
      return NextResponse.json({ error: 'No autorizado' }, { status: 403 });
    }
    
    // Conectar al pool de la base de datos
    const client = await pool.connect();
    
    try {
      // Iniciar una transacción
      await client.query('BEGIN');
      
      // Eliminar la dirección
      const deleteQuery = 'DELETE FROM auth.addresses WHERE id = $1';
      await client.query(deleteQuery, [addressId]);
      
      // Si era la dirección predeterminada, establecer otra como predeterminada
      if (isDefault) {
        // Obtener otra dirección para establecerla como predeterminada
        const otherAddressQuery = 'SELECT id FROM auth.addresses WHERE user_id = $1 LIMIT 1';
        const otherAddressResult = await client.query(otherAddressQuery, [addressOwnerId]);
        
        if (otherAddressResult.rows.length > 0) {
          const newDefaultAddressId = otherAddressResult.rows[0].id;
          const updateDefaultQuery = 'UPDATE auth.addresses SET is_default = true WHERE id = $1';
          await client.query(updateDefaultQuery, [newDefaultAddressId]);
        }
      }
      
      // Confirmar la transacción
      await client.query('COMMIT');
      
      return NextResponse.json({ message: 'Dirección eliminada correctamente' });
    } catch (error) {
      // Revertir la transacción en caso de error
      await client.query('ROLLBACK');
      throw error;
    } finally {
      // Liberar el cliente
      client.release();
    }
  } catch (error) {
    console.error('Error al eliminar dirección:', error);
    return NextResponse.json(
      { error: 'Error al eliminar la dirección' },
      { status: 500 }
    );
  }
}