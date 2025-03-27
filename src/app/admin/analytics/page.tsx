"use client"

import { useState, useEffect } from "react"
import { 
  ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, 
  Users, Calendar, Filter, Download, TrendingUp, Loader2
} from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { DatePickerWithRange } from "@/components/ui/date-range-picker"
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, LineChart, Line, XAxis, 
  YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell
} from 'recharts'
import { useToast } from "@/components/ui/use-toast"

// Colores para los gráficos
const CHART_COLORS = {
  primary: "#2563eb",
  secondary: "#0f766e",
  accent: "#9333ea",
  success: "#16a34a",
  warning: "#eab308",
  danger: "#dc2626",
  info: "#0ea5e9",
};

// Colores para gráfico de pie
const PIE_COLORS = ["#2563eb", "#0f766e", "#9333ea", "#16a34a", "#eab308", "#dc2626", "#0ea5e9"];

// Rangos de tiempo predefinidos
const TIME_RANGES = {
  "7days": { label: "Últimos 7 días", days: 7 },
  "30days": { label: "Últimos 30 días", days: 30 },
  "90days": { label: "Últimos 90 días", days: 90 },
  "year": { label: "Último año", days: 365 },
};

const AnalyticsPage = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [timeRange, setTimeRange] = useState("30days");
  const [salesData, setSalesData] = useState([]);
  const [productData, setProductData] = useState([]);
  const [categoryData, setCategoryData] = useState([]);
  const [customerData, setCustomerData] = useState([]);
  const [summaryData, setSummaryData] = useState({
    totalSales: 0,
    totalOrders: 0,
    totalCustomers: 0,
    avgOrderValue: 0,
    conversionRate: 0,
    salesGrowth: 0,
    ordersGrowth: 0,
  });
  const { toast } = useToast();

  // Cargar datos
  useEffect(() => {
    const fetchAnalyticsData = async () => {
      setIsLoading(true);
      try {
        // Endpoint único que devuelve todos los datos necesarios
        // En un entorno real, esto podría dividirse en múltiples endpoints para mejorar el rendimiento
        const response = await fetch(`/api/analytics?timeRange=${timeRange}`);
        
        if (!response.ok) {
          throw new Error("Error al cargar datos analíticos");
        }
        
        const data = await response.json();
        
        // Actualizar estado con los datos recibidos
        setSalesData(data.salesData || []);
        setProductData(data.productData || []);
        setCategoryData(data.categoryData || []);
        setCustomerData(data.customerData || []);
        setSummaryData(data.summary || {});
      } catch (error) {
        console.error("Error fetching analytics data:", error);
        toast({
          title: "Error",
          description: "No se pudieron cargar los datos analíticos",
          variant: "destructive",
        });
        
        // Usar datos de ejemplo en caso de error
        setMockData();
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange, toast]);

  // Función para generar datos de ejemplo (en caso de que la API no esté disponible)
  const setMockData = () => {
    // Datos de ejemplo para ventas diarias
    const mockSalesData = [];
    const days = TIME_RANGES[timeRange].days;
    const now = new Date();
    
    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now);
      date.setDate(date.getDate() - i);
      
      mockSalesData.push({
        date: date.toISOString().split('T')[0],
        sales: Math.floor(Math.random() * 10000) + 1000,
        orders: Math.floor(Math.random() * 20) + 1,
      });
    }
    
    // Productos más vendidos
    const mockProductData = [
      { name: "Nike Air Jordan 1", value: 35, sales: 87500 },
      { name: "Adidas Ultraboost", value: 25, sales: 62500 },
      { name: "Vans Old Skool", value: 15, sales: 37500 },
      { name: "Nike Dunk Low", value: 15, sales: 37500 },
      { name: "New Balance 550", value: 10, sales: 25000 }
    ];
    
    // Ventas por categoría
    const mockCategoryData = [
      { name: "Sneakers", value: 60, sales: 150000 },
      { name: "Ropa", value: 25, sales: 62500 },
      { name: "Accesorios", value: 10, sales: 25000 },
      { name: "Otros", value: 5, sales: 12500 }
    ];
    
    // Datos de adquisición de clientes
    const mockCustomerData = [
      { name: "Directo", value: 40 },
      { name: "Orgánico", value: 25 },
      { name: "Social", value: 20 },
      { name: "Email", value: 10 },
      { name: "Referidos", value: 5 }
    ];
    
    // Resumen de métricas
    const mockSummaryData = {
      totalSales: 250000,
      totalOrders: 500,
      totalCustomers: 350,
      avgOrderValue: 500,
      conversionRate: 2.5,
      salesGrowth: 15.3,
      ordersGrowth: 12.8,
    };
    
    setSalesData(mockSalesData);
    setProductData(mockProductData);
    setCategoryData(mockCategoryData);
    setCustomerData(mockCustomerData);
    setSummaryData(mockSummaryData);
  };

  // Función para formatear números como moneda
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Función para formatear porcentajes
  const formatPercent = (value) => {
    return `${value.toFixed(1)}%`;
  };

  // Función para manejar el cambio de rango de tiempo
  const handleTimeRangeChange = (value) => {
    setTimeRange(value);
  };

  // Función para exportar datos
  const handleExportData = () => {
    toast({
      title: "Exportando datos",
      description: "Los datos se están descargando como CSV",
    });
    
    // Aquí iría la lógica real para exportar los datos
    setTimeout(() => {
      toast({
        title: "Exportación completada",
        description: "Los datos se han descargado correctamente",
      });
    }, 1500);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Análisis y Estadísticas</h1>
          <p className="text-muted-foreground">
            Visualiza y analiza el rendimiento de tu tienda
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={handleTimeRangeChange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Periodo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7days">Últimos 7 días</SelectItem>
              <SelectItem value="30days">Últimos 30 días</SelectItem>
              <SelectItem value="90days">Últimos 90 días</SelectItem>
              <SelectItem value="year">Último año</SelectItem>
            </SelectContent>
          </Select>
          
          <Button variant="outline" onClick={handleExportData}>
            <Download className="h-4 w-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <span className="ml-2">Cargando datos analíticos...</span>
        </div>
      ) : (
        <>
          {/* Tarjetas de resumen */}
          <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ventas Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.totalSales)}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.salesGrowth > 0 ? (
                    <span className="text-green-500 inline-flex items-center">
                      <ArrowUp className="mr-1 h-3 w-3" />
                      {formatPercent(summaryData.salesGrowth)}
                    </span>
                  ) : (
                    <span className="text-red-500 inline-flex items-center">
                      <ArrowDown className="mr-1 h-3 w-3" />
                      {formatPercent(Math.abs(summaryData.salesGrowth))}
                    </span>
                  )}
                  {" vs periodo anterior"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalOrders}</div>
                <p className="text-xs text-muted-foreground">
                  {summaryData.ordersGrowth > 0 ? (
                    <span className="text-green-500 inline-flex items-center">
                      <ArrowUp className="mr-1 h-3 w-3" />
                      {formatPercent(summaryData.ordersGrowth)}
                    </span>
                  ) : (
                    <span className="text-red-500 inline-flex items-center">
                      <ArrowDown className="mr-1 h-3 w-3" />
                      {formatPercent(Math.abs(summaryData.ordersGrowth))}
                    </span>
                  )}
                  {" vs periodo anterior"}
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Promedio</CardTitle>
                <TrendingUp className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{formatCurrency(summaryData.avgOrderValue)}</div>
                <p className="text-xs text-muted-foreground">
                  Por pedido
                </p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Clientes</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{summaryData.totalCustomers}</div>
                <p className="text-xs text-muted-foreground">
                  Tasa de conversión: {formatPercent(summaryData.conversionRate)}
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Pestañas para diferentes vistas */}
          <Tabs defaultValue="sales" className="space-y-4">
            <TabsList>
              <TabsTrigger value="sales">Ventas</TabsTrigger>
              <TabsTrigger value="products">Productos</TabsTrigger>
              <TabsTrigger value="customers">Clientes</TabsTrigger>
            </TabsList>
            
            {/* Pestaña de Ventas */}
            <TabsContent value="sales" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Gráfico de Tendencia de Ventas */}
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle>Tendencia de Ventas</CardTitle>
                    <CardDescription>
                      Ventas diarias durante el periodo seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={salesData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 0,
                          bottom: 0,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="sales"
                          stroke={CHART_COLORS.primary}
                          fill={CHART_COLORS.primary}
                          fillOpacity={0.2}
                          name="Ventas"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Gráfico de Distribución por Categoría */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Ventas por Categoría</CardTitle>
                    <CardDescription>
                      Distribución de ventas por categoría de productos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Gráfico de Pedidos */}
              <Card>
                <CardHeader>
                  <CardTitle>Cantidad de Pedidos</CardTitle>
                  <CardDescription>
                    Número de pedidos durante el periodo seleccionado
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={salesData}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="date" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar
                        dataKey="orders"
                        fill={CHART_COLORS.secondary}
                        name="Pedidos"
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de Productos */}
            <TabsContent value="products" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Productos Más Vendidos */}
                <Card>
                  <CardHeader>
                    <CardTitle>Productos Más Vendidos</CardTitle>
                    <CardDescription>
                      Los productos más populares por cantidad vendida
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={productData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar
                          dataKey="value"
                          fill={CHART_COLORS.accent}
                          name="% de Ventas"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Ingresos por Producto */}
                <Card>
                  <CardHeader>
                    <CardTitle>Ingresos por Producto</CardTitle>
                    <CardDescription>
                      Los productos que generan más ingresos
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        layout="vertical"
                        data={productData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 100,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis type="number" />
                        <YAxis type="category" dataKey="name" />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar
                          dataKey="sales"
                          fill={CHART_COLORS.success}
                          name="Ingresos"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Tabla de Rendimiento de Productos */}
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento de Productos</CardTitle>
                  <CardDescription>
                    Análisis detallado de los productos más vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="rounded-md border">
                    <table className="w-full caption-bottom text-sm">
                      <thead>
                        <tr className="border-b transition-colors hover:bg-muted/50">
                          <th className="h-12 px-4 text-left align-middle font-medium">Producto</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Unidades Vendidas</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Ingresos</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">% del Total</th>
                          <th className="h-12 px-4 text-left align-middle font-medium">Tendencia</th>
                        </tr>
                      </thead>
                      <tbody>
                        {productData.map((product, index) => (
                          <tr key={index} className="border-b transition-colors hover:bg-muted/50">
                            <td className="p-4 align-middle">{product.name}</td>
                            <td className="p-4 align-middle">{Math.round(product.value * 5)}</td>
                            <td className="p-4 align-middle">{formatCurrency(product.sales)}</td>
                            <td className="p-4 align-middle">{product.value}%</td>
                            <td className="p-4 align-middle">
                              <span className="text-green-500 inline-flex items-center">
                                <ArrowUp className="mr-1 h-3 w-3" />
                                {Math.round(Math.random() * 20)}%
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de Clientes */}
            <TabsContent value="customers" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                {/* Distribución de Adquisición de Clientes */}
                <Card>
                  <CardHeader>
                    <CardTitle>Adquisición de Clientes</CardTitle>
                    <CardDescription>
                      Distribución por canal de adquisición
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, value }) => `${name}: ${value}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {customerData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
                
                {/* Frecuencia de Compra */}
                <Card>
                  <CardHeader>
                    <CardTitle>Frecuencia de Compra</CardTitle>
                    <CardDescription>
                      Análisis de frecuencia de compra de clientes
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={[
                          { name: "1 vez", value: 45 },
                          { name: "2 veces", value: 28 },
                          { name: "3 veces", value: 15 },
                          { name: "4 veces", value: 8 },
                          { name: "5+ veces", value: 4 }
                        ]}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis />
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                        <Bar
                          dataKey="value"
                          fill={CHART_COLORS.info}
                          name="% de Clientes"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </CardContent>
                </Card>
              </div>
              
              {/* Retención de Clientes */}
              <Card>
                <CardHeader>
                  <CardTitle>Retención de Clientes</CardTitle>
                  <CardDescription>
                    Tasa de retención mensual de clientes
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart
                      data={[
                        { month: "Ene", retention: 100 },
                        { month: "Feb", retention: 87 },
                        { month: "Mar", retention: 75 },
                        { month: "Abr", retention: 68 },
                        { month: "May", retention: 62 },
                        { month: "Jun", retention: 58 },
                        { month: "Jul", retention: 55 },
                        { month: "Ago", retention: 52 },
                        { month: "Sep", retention: 48 },
                        { month: "Oct", retention: 45 },
                        { month: "Nov", retention: 43 },
                        { month: "Dec", retention: 40 }
                      ]}
                      margin={{
                        top: 10,
                        right: 30,
                        left: 20,
                        bottom: 5,
                      }}
                    >
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip formatter={(value) => `${value}%`} />
                      <Legend />
                      <Line
                        type="monotone"
                        dataKey="retention"
                        stroke={CHART_COLORS.warning}
                        name="% Retención"
                        strokeWidth={2}
                      />
                    </LineChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  );
};

export default AnalyticsPage;