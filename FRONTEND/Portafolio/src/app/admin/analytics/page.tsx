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
        // Obtener datos de la API
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
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAnalyticsData();
  }, [timeRange, toast]);

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
    // Crear CSV de datos de ventas
    if (salesData.length === 0) {
      toast({
        title: "Sin datos",
        description: "No hay datos para exportar",
        variant: "destructive",
      });
      return;
    }
    
    // Crear encabezados CSV
    const headers = Object.keys(salesData[0]).join(',');
    
    // Crear filas CSV
    const rows = salesData.map(row => 
      Object.values(row).map(value => 
        typeof value === 'string' && value.includes(',') ? `"${value}"` : value
      ).join(',')
    ).join('\n');
    
    // Combinar encabezados y filas
    const csv = `${headers}\n${rows}`;
    
    // Crear blob y descargar
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ventas_${timeRange}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    toast({
      title: "Exportación completada",
      description: "Los datos se han descargado correctamente",
    });
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
                    {salesData.length > 0 ? (
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
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de ventas para mostrar</p>
                      </div>
                    )}
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
                    {categoryData.length > 0 ? (
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
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de categorías para mostrar</p>
                      </div>
                    )}
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
                  {salesData.length > 0 ? (
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
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de pedidos para mostrar</p>
                    </div>
                  )}
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
                    {productData.length > 0 ? (
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
                          <Tooltip formatter={(value) => `${value} unidades`} />
                          <Legend />
                          <Bar
                            dataKey="soldQuantity"
                            fill={CHART_COLORS.accent}
                            name="Unidades Vendidas"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de productos para mostrar</p>
                      </div>
                    )}
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
                    {productData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                          data={productData}
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
                          <Tooltip formatter={(value) => formatCurrency(value)} />
                          <Legend />
                          <Bar
                            dataKey="revenue"
                            fill={CHART_COLORS.info}
                            name="Ingresos"
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de ingresos para mostrar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Rendimiento de Stock */}
              <Card>
                <CardHeader>
                  <CardTitle>Rendimiento de Inventario</CardTitle>
                  <CardDescription>
                    Rotación de inventario y productos más vendidos
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {productData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart
                        data={productData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="name" />
                        <YAxis yAxisId="left" orientation="left" stroke={CHART_COLORS.primary} />
                        <YAxis yAxisId="right" orientation="right" stroke={CHART_COLORS.secondary} />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="turnover"
                          stroke={CHART_COLORS.primary}
                          activeDot={{ r: 8 }}
                          name="Rotación"
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="stock"
                          stroke={CHART_COLORS.secondary}
                          name="Inventario"
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de inventario para mostrar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
            
            {/* Pestaña de Clientes */}
            <TabsContent value="customers" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
                {/* Adquisición de Clientes */}
                <Card className="md:col-span-4">
                  <CardHeader>
                    <CardTitle>Adquisición de Clientes</CardTitle>
                    <CardDescription>
                      Nuevos clientes durante el periodo seleccionado
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {customerData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart
                          data={customerData}
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
                          <Tooltip />
                          <Legend />
                          <Area
                            type="monotone"
                            dataKey="newCustomers"
                            stroke={CHART_COLORS.success}
                            fill={CHART_COLORS.success}
                            fillOpacity={0.2}
                            name="Nuevos Clientes"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de clientes para mostrar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
                
                {/* Retención de Clientes */}
                <Card className="md:col-span-3">
                  <CardHeader>
                    <CardTitle>Retención de Clientes</CardTitle>
                    <CardDescription>
                      Tasa de retención por cohorte
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="h-80">
                    {customerData.length > 0 ? (
                      <ResponsiveContainer width="100%" height="100%">
                        <LineChart
                          data={customerData}
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
                            name="Retención"
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    ) : (
                      <div className="flex h-full items-center justify-center">
                        <p className="text-muted-foreground">No hay datos de retención para mostrar</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>
              
              {/* Valor del Cliente */}
              <Card>
                <CardHeader>
                  <CardTitle>Valor del Cliente</CardTitle>
                  <CardDescription>
                    LTV (Lifetime Value) por segmento de cliente
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {customerData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={customerData}
                        margin={{
                          top: 10,
                          right: 30,
                          left: 20,
                          bottom: 5,
                        }}
                      >
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="segment" />
                        <YAxis />
                        <Tooltip formatter={(value) => formatCurrency(value)} />
                        <Legend />
                        <Bar
                          dataKey="ltv"
                          fill={CHART_COLORS.accent}
                          name="Valor del Cliente (LTV)"
                        />
                        <Bar
                          dataKey="averageOrder"
                          fill={CHART_COLORS.info}
                          name="Valor Promedio de Pedido"
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de valor del cliente para mostrar</p>
                    </div>
                  )}
                </CardContent>
              </Card>
              
              {/* Mapa de Frecuencia */}
              <Card>
                <CardHeader>
                  <CardTitle>Frecuencia de Compra</CardTitle>
                  <CardDescription>
                    Distribución de clientes por frecuencia de compra
                  </CardDescription>
                </CardHeader>
                <CardContent className="h-80">
                  {customerData.length > 0 ? (
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={customerData.filter(d => d.frequency)}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {customerData.filter(d => d.frequency).map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `${value}%`} />
                        <Legend />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="flex h-full items-center justify-center">
                      <p className="text-muted-foreground">No hay datos de frecuencia para mostrar</p>
                    </div>
                  )}
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