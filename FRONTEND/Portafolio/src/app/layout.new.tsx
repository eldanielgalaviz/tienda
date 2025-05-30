"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Footer from '../components/layout/Footer';

export default function ClientHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const checkUser = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (data && data.user) {
          setUser(data.user);
          setIsAdmin(Boolean(data.user.is_admin));
          console.log("Header: usuario es admin:", Boolean(data.user.is_admin));
        }
      } catch (error) {
        console.error('Error verificando usuario:', error);
      }
    };
    
    checkUser();
  }, []);

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <a href="/" className="font-bold text-xl">
            Fashion Treats
          </a><s></s>

          <nav className="hidden md:flex items-center gap-6">
            {isAdmin && (
              <a href="/admin" className="bg-red-500 text-white px-3 py-2 rounded hover:bg-red-600 transition-colors">
                PANEL ADMIN
              </a>
            )}
            <a href="/tienda" className="hover:text-gray-600 transition-colors">
              Tienda
            </a>
            <a href="/nuevo" className="hover:text-gray-600 transition-colors">
              Nuevo
            </a>
            <a href="/marcas" className="hover:text-gray-600 transition-colors">
              Marcas
            </a>
            <a href="/sale" className="hover:text-gray-600 transition-colors">
              Sale
            </a>
          </nav>

          <div className="flex items-center gap-4">
            <a href="/buscar" className="hover:text-gray-600 transition-colors">
              Buscar
            </a>
            <a href="/cuenta" className="hover:text-gray-600 transition-colors">
              {user ? user.first_name : 'Cuenta'}
            </a>
            <a href="/carrito" className="hover:text-gray-600 transition-colors">
              Carrito (0)
            </a>
          </div>
        </div>
      </div>
      <Footer /> {/* Añade el componente Footer */}

      {/* Debug indicator */}
      {process.env.NODE_ENV !== 'production' && (
        <div style={{position: 'fixed', top: '16px', left: '16px', backgroundColor: 'red', color: 'white', padding: '4px 8px', fontSize: '12px', zIndex: 9999, borderRadius: '4px'}}>
          Admin: {String(isAdmin)}
        </div>
      )}
    </header>
  );
}