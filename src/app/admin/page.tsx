// src/app/admin/page.tsx
"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import Link from "next/link";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp
} from "lucide-react";

export default function AdminPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    // Verificar si el usuario es admin mediante una petición a la API
    const checkAdmin = async () => {
      try {
        const response = await fetch('/api/auth/me');
        const data = await response.json();
        
        if (response.ok && data.user && data.user.is_admin) {
          setIsAdmin(true);
        } else {
          // Redirigir si no es admin
          router.push('/');
        }
      } catch (error) {
        console.error('Error verificando admin:', error);
        router.push('/');
      } finally {
        setLoading(false);
      }
    };
    
    checkAdmin();
  }, [router]);
  
  if (loading) {
    return <div className="container mx-auto p-8">Cargando...</div>;
  }
  
  if (!isAdmin) {
    return null; // No renderizar nada mientras redirecciona
  }
  
  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-8">Panel de Administración</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Link href="/admin/dashboard" className="border p-6 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center mb-4">
            <LayoutDashboard className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Dashboard</h2>
          </div>
          <p className="text-gray-600">Vista general de estadísticas y métricas</p>
        </Link>
        
        <Link href="/admin/products" className="border p-6 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center mb-4">
            <Package className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Productos</h2>
          </div>
          <p className="text-gray-600">Gestionar productos y categorías</p>
        </Link>
        
        <Link href="/admin/orders" className="border p-6 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center mb-4">
            <ShoppingBag className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Pedidos</h2>
          </div>
          <p className="text-gray-600">Ver y gestionar pedidos</p>
        </Link>
        
        <Link href="/admin/customers" className="border p-6 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center mb-4">
            <Users className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Clientes</h2>
          </div>
          <p className="text-gray-600">Gestionar clientes y cuentas</p>
        </Link>
        
        <Link href="/admin/analytics" className="border p-6 rounded-lg hover:bg-gray-50 transition-colors">
          <div className="flex items-center mb-4">
            <TrendingUp className="h-8 w-8 mr-3" />
            <h2 className="text-xl font-semibold">Analíticas</h2>
          </div>
          <p className="text-gray-600">Reportes y estadísticas avanzadas</p>
        </Link>
      </div>
    </div>
  );
}