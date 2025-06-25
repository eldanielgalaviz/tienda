import { NextResponse } from 'next/server';
import * as cookie from "cookie";


export async function POST() {
  // Crear una cookie expirada para eliminar el token
  const serializedCookie = cookie.serialize('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict',
    expires: new Date(0),
    path: '/',
  });

  const response = NextResponse.json({
    message: 'Sesión cerrada correctamente',
  });

  response.headers.set('Set-Cookie', serializedCookie);

  return response;
}