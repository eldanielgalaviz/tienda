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
import AdminOverview from "./AdminOverview";
import AdminAnalytics from "../Analytics";
import AdminProducts from "@/app/admin/products/page";
import AdminCustomers from "@/app/admin/customers/page";
import AdminOrders from "@/app/admin/orders/page";
import AdminSettings from "@/app/admin/settings/page";

const AdminDashboard = () => {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Función para determinar qué componente mostrar
  const renderContent = () => {
    const path = pathname || '/admin';
    
    if (path.includes("/admin/products")) {
      return <AdminProducts />;
    } else if (path.includes("/admin/customers")) {
      return <AdminCustomers />;
    } else if (path.includes("/admin/orders")) {
      return <AdminOrders />;
    } else if (path.includes("/admin/analytics")) {
      return <AdminAnalytics />;
    } else if (path.includes("/admin/settings")) {
      return <AdminSettings />;
    } else {
      return <AdminOverview />;
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
                <SidebarMenuButton asChild isActive={pathname === "/admin" || pathname === "/admin/dashboard"}>
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