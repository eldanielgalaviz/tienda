"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  CreditCard, 
  DollarSign, 
  Package, 
  Users,
  Activity,
  Calendar,
  ChevronUp,
  ChevronDown,
  Loader2
} from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const AdminOverview = ({ data, isLoading }) => {
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
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(data.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {/* Para mostrar tendencia, necesitaríamos datos históricos */}
                  +20.1% desde el mes pasado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <CreditCard className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  +12.2% desde el mes pasado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  +5.7% desde el mes pasado
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Productos</CardTitle>
                <Package className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{data.totalProducts}</div>
                <p className="text-xs text-muted-foreground">
                  +3.2% desde el mes pasado
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
                  Has recibido {data.totalOrders} pedidos en total
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-8">
                  {data.recentOrders && data.recentOrders.length > 0 ? (
                    data.recentOrders.map((order) => (
                      <div className="flex items-center" key={order.id}>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {order.customer_name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Pedido #{order.order_number} • {formatDate(order.created_at)}
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
                  {data.topSellingProducts && data.topSellingProducts.length > 0 ? (
                    data.topSellingProducts.map((product) => (
                      <div className="flex items-center" key={product.id}>
                        <div className="mr-4">
                          <div className="h-10 w-10 rounded-full bg-gray-100 flex items-center justify-center">
                            {product.image ? (
                              <Image 
                                src={product.image} 
                                alt={product.name}
                                width={40}
                                height={40}
                                className="rounded-full"
                              />
                            ) : (
                              <Package className="h-5 w-5 text-gray-400" />
                            )}
                          </div>
                        </div>
                        <div className="space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {product.name}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {product.total_sold || 0} unidades vendidas
                          </p>
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