"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";
import { useCart } from "@/context/CartContext";

export default function ClientHeader() {
  const [isAdmin, setIsAdmin] = useState(false);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  
  // Usar el contexto del carrito
  const { totalItems } = useCart();

  useEffect(() => {
    const checkUser = async () => {
      try {
        setIsLoading(true);
        const response = await fetch('/api/auth/me');
        const data = await response.json();
                
        if (data && data.user) {
          setUser(data.user);
          setIsAdmin(Boolean(data.user.is_admin));
          console.log("Usuario admin:", Boolean(data.user.is_admin));
        }
      } catch (error) {
        console.error('Error verificando usuario:', error);
      } finally {
        setIsLoading(false);
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
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {isAdmin && (
              <a href="/admin" className="bg-black text-white px-3 py-2 rounded hover:bg-gray-800 transition-colors">
                Panel Admin
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
            {/* Mostrar Ingresar y Registrarse solo si no hay usuario logueado */}
            {!user && !isLoading && (
              <>
                <a href="/login" className="hover:text-gray-600 transition-colors">
                  Ingresar
                </a>
                <a href="/registro" className="hover:text-gray-600 transition-colors">
                  Registrarse
                </a>
              </>
            )}
            <a href="/buscar" className="hover:text-gray-600 transition-colors">
              Buscar
            </a>
            <a href="/cuenta" className="hover:text-gray-600 transition-colors">
              {user ? user.first_name : 'Cuenta'}
            </a>
            <a href="/carrito" className="hover:text-gray-600 transition-colors relative">
              <ShoppingCart className="h-5 w-5" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                  {totalItems}
                </span>
              )}
            </a>
          </div>
        </div>
      </div>
    </header>
  );
}