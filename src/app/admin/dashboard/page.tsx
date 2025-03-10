"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
  LayoutDashboard,
  ShoppingBag,
  Package,
  Users,
  TrendingUp,
  Settings,
  LogOut,
  Menu,
  X,
  Bell,
  Search,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  SidebarProvider,
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from "@/components/ui/sidebar";

// Importar componentes de Dashboard
import AdminOverview from "@/app/admin/Overview/page";
import AdminProducts from "@/app/admin/products/page";
import AdminCustomers from "@/app/admin/customers/page";
import AdminOrders from "@/app/admin/orders/page";

const AdminDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dashboardData, setDashboardData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    recentOrders: [],
    topSellingProducts: []
  });
  const [isLoading, setIsLoading] = useState(true);
  
  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true);
        
        // Fetch summary data
        const summaryPromise = fetch('/api/admin/summary').then(res => res.json());
        
        // Fetch recent orders
        const ordersPromise = fetch('/api/orders?limit=5').then(res => res.json());
        
        // Fetch top selling products
        const productsPromise = fetch('/api/products/top?limit=5').then(res => res.json());
        
        // Wait for all requests to complete
        const [summaryData, ordersData, productsData] = await Promise.all([
          summaryPromise,
          ordersPromise,
          productsPromise
        ]);
        
        setDashboardData({
          totalSales: summaryData.totalSales || 0,
          totalOrders: summaryData.totalOrders || 0,
          totalCustomers: summaryData.totalCustomers || 0,
          totalProducts: summaryData.totalProducts || 0,
          recentOrders: ordersData.orders || [],
          topSellingProducts: productsData.products || []
        });
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    // Only fetch data for the overview page
    if (pathname === "/admin") {
      fetchDashboardData();
    } else {
      setIsLoading(false);
    }
  }, [pathname]);
  
  // Función para determinar qué componente mostrar
  const renderContent = () => {
    switch (pathname) {
      case "/admin":
        return <AdminOverview data={dashboardData} isLoading={isLoading} />;
      case "/admin/products":
        return <AdminProducts />;
      case "/admin/customers":
        return <AdminCustomers />;
      case "/admin/orders":
        return <AdminOrders />;
      default:
        return <AdminOverview data={dashboardData} isLoading={isLoading} />;
    }
  };

  return (
    <SidebarProvider>
      <div className="grid min-h-screen w-full lg:grid-cols-[280px_1fr]">
        {/* Sidebar */}
        <Sidebar>
          <SidebarHeader>
            <div className="flex items-center px-4 py-2">
              <div className="bg-black p-1 mr-2">
                <span className="text-white font-bold text-sm">ft</span>
              </div>
              <span className="font-bold">FASHION TREATS</span>
            </div>
          </SidebarHeader>
          <SidebarContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin"}>
                  <Link href="/admin">
                    <LayoutDashboard className="h-5 w-5" />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/orders"}>
                  <Link href="/admin/orders">
                    <ShoppingBag className="h-5 w-5" />
                    <span>Pedidos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/products"}>
                  <Link href="/admin/products">
                    <Package className="h-5 w-5" />
                    <span>Productos</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/customers"}>
                  <Link href="/admin/customers">
                    <Users className="h-5 w-5" />
                    <span>Clientes</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/analytics"}>
                  <Link href="/admin/analytics">
                    <TrendingUp className="h-5 w-5" />
                    <span>Analíticas</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={pathname === "/admin/settings"}>
                  <Link href="/admin/settings">
                    <Settings className="h-5 w-5" />
                    <span>Configuración</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarContent>
          <SidebarFooter>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <Link href="/">
                    <LogOut className="h-5 w-5" />
                    <span>Salir</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarFooter>
        </Sidebar>

        {/* Main Content */}
        <div className="flex flex-col">
          <header className="sticky top-0 z-10 flex h-16 items-center gap-4 border-b bg-background px-6">
            <SidebarTrigger />

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>

            <div className="w-full flex-1">
              <form>
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="search"
                    placeholder="Buscar..."
                    className="w-full bg-background shadow-none appearance-none pl-8 md:w-2/3 lg:w-1/3"
                  />
                </div>
              </form>
            </div>

            <Button variant="ghost" size="icon" className="ml-auto">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notificaciones</span>
            </Button>

            <Button variant="ghost" size="icon" className="rounded-full">
              <img
                src="/placeholder.svg?height=32&width=32"
                alt="Avatar"
                className="rounded-full"
                width={32}
                height={32}
              />
              <span className="sr-only">Perfil</span>
            </Button>
          </header>

          <main className="flex-1 p-6">
            {renderContent()}
          </main>
        </div>
      </div>
    </SidebarProvider>
  );
};

export default AdminDashboard;