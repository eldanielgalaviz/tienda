import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { jwtVerify } from 'jose';

// Rutas que requieren autenticación
const protectedRoutes = [
  '/cuenta',
  '/carrito',
  '/checkout',
];

// Rutas que requieren ser administrador
const adminRoutes = [
  '/admin',
];

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const { pathname } = request.nextUrl;

  // Verificar si la ruta requiere autenticación
  const isProtectedRoute = protectedRoutes.some(route => 
    pathname.startsWith(route)
  );
  
  // Verificar si la ruta requiere ser administrador
  const isAdminRoute = adminRoutes.some(route => 
    pathname.startsWith(route)
  );

  // Si no hay token y la ruta está protegida
  if (!token && (isProtectedRoute || isAdminRoute)) {
    const url = new URL('/login', request.url);
    url.searchParams.set('redirect', pathname);
    return NextResponse.redirect(url);
  }

  // Si hay token, verificarlo
  if (token) {
    try {
      // Verificar el token (usando jose en lugar de jsonwebtoken que no funciona en edge)
      const secretKey = new TextEncoder().encode(
        process.env.JWT_SECRET || 'your-secret-key-change-in-production'
      );
      
      const { payload } = await jwtVerify(token, secretKey);
      
      // Si es ruta de admin y el usuario no es admin
      if (isAdminRoute && !payload.isAdmin) {
        return NextResponse.redirect(new URL('/', request.url));
      }
      
    } catch (error) {
      // Token inválido o expirado
      const url = new URL('/login', request.url);
      if (isProtectedRoute || isAdminRoute) {
        url.searchParams.set('redirect', pathname);
        return NextResponse.redirect(url);
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     * - api routes that handle authentication
     */
    '/((?!_next/static|_next/image|favicon.ico|public|api/auth).*)',
  ],
};