"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { 
  LayoutDashboard, 
  ShoppingBag, 
  Package, 
  Users, 
  TrendingUp,
  Activity,
  Calendar,
  ChevronUp,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";

// Componente para el Dashboard de Administración
const AdminOverview = () => {
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    topProducts: [],
    recentOrders: [],
    salesGrowth: 0,
    ordersGrowth: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Cargar datos del dashboard
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Llamar a la API de analytics para obtener datos
        const analyticsResponse = await fetch('/api/analytics?timeRange=30days');
        
        // Si hay un error en la respuesta
        if (!analyticsResponse.ok) {
          throw new Error('Error al cargar datos analíticos');
        }
        
        // Procesar la respuesta
        const analyticsData = await analyticsResponse.json();
        
        // Llamar a la API de productos para obtener los más vendidos
        const productsResponse = await fetch('/api/products/top?limit=5');
        const productsData = await productsResponse.json();
        
        // Llamar a la API de pedidos para obtener los más recientes
        const ordersResponse = await fetch('/api/orders?limit=5');
        const ordersData = await ordersResponse.json();

        // Actualizar estado con todos los datos
        setDashboardData({
          totalSales: analyticsData.summary?.totalSales || 0,
          totalOrders: analyticsData.summary?.totalOrders || 0,
          totalCustomers: analyticsData.summary?.totalCustomers || 0,
          totalProducts: productsData.products?.length || 0,
          topProducts: productsData.products || [],
          recentOrders: ordersData.orders || [],
          salesGrowth: analyticsData.summary?.salesGrowth || 0,
          ordersGrowth: analyticsData.summary?.ordersGrowth || 0
        });
      } catch (error) {
        console.error('Error al cargar datos del dashboard:', error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos del dashboard",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
  }, [toast]);

  // Formatear valores para mostrar
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    return new Date(dateString).toLocaleDateString('es-MX', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  return (
    <div>
      <h2 className="text-3xl font-bold tracking-tight mb-6">Dashboard</h2>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Stats Grid */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(dashboardData.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.salesGrowth > 0 ? (
                    <span className="text-green-500 inline-flex items-center">
                      <ChevronUp className="mr-1 h-3 w-3" />
                      +{dashboardData.salesGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 inline-flex items-center">
                      <ChevronDown className="mr-1 h-3 w-3" />
                      {Math.abs(dashboardData.salesGrowth).toFixed(1)}%
                    </span>
                  )}
                  {" desde el mes pasado"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingBag className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {dashboardData.ordersGrowth > 0 ? (
                    <span className="text-green-500 inline-flex items-center">
                      <ChevronUp className="mr-1 h-3 w-3" />
                      +{dashboardData.ordersGrowth.toFixed(1)}%
                    </span>
                  ) : (
                    <span className="text-red-500 inline-flex items-center">
                      <ChevronDown className="mr-1 h-3 w-3" />
                      {Math.abs(dashboardData.ordersGrowth).toFixed(1)}%
                    </span>
                  )}
                  {" desde el mes pasado"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  <span className="text-green-500 inline-flex items-center">
                    <ChevronUp className="mr-1 h-3 w-3" />
                    +5.7%
                  </span>
                  {" desde el mes pasado"}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{dashboardData.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  Productos activos en inventario
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
            {/* Recent Sales */}
            <Card className="col-span-4">
              <CardHeader>
                <CardTitle>Pedidos Recientes</CardTitle>
                <CardDescription>
                  Has recibido {dashboardData.totalOrders} pedidos en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData.recentOrders && dashboardData.recentOrders.length > 0 ? (
                    dashboardData.recentOrders.map((order) => (
                      <div className="flex items-center" key={order.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {order.customer || "Cliente"}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.id} • {formatDate(order.date)}
                          </p>
                        </div>
                        <div className="ml-auto font-medium">
                          {formatCurrency(order.total)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No hay pedidos recientes</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Top Selling Products */}
            <Card className="col-span-3">
              <CardHeader>
                <CardTitle>Productos Más Vendidos</CardTitle>
                <CardDescription>
                  Los productos con más ventas este mes
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {dashboardData.topProducts && dashboardData.topProducts.length > 0 ? (
                    dashboardData.topProducts.map((product) => (
                      <div className="flex items-center" key={product.id}>
                        <div className="mr-4">
                          <div className="h-10 w-10 relative rounded-full bg-gray-100 flex items-center justify-center overflow-hidden">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.name}
                                fill
                                className="object-cover"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1 flex-1">
                          <p className="text-sm font-medium leading-none">
                            {product.name}
                          </p>
                          <p className="text-xs text-muted-foreground truncate max-w-[200px]">
                            {product.brand || ""}
                          </p>
                        </div>
                        <div className="font-medium">
                          {formatCurrency(product.price)}
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-muted-foreground">No hay datos de ventas</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminOverview;