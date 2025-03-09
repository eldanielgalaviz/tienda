import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"

const AdminAnalytics = () => {
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Analíticas</h1>

        <Tabs defaultValue="7days">
          <TabsList>
            <TabsTrigger value="7days">7 días</TabsTrigger>
            <TabsTrigger value="30days">30 días</TabsTrigger>
            <TabsTrigger value="90days">90 días</TabsTrigger>
            <TabsTrigger value="year">Año</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">$45,231.89</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +20.1%
              </span>{" "}
              desde el periodo anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos</CardTitle>
            <ShoppingCart className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+573</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +12.2%
              </span>{" "}
              desde el periodo anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Nuevos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+128</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +4.3%
              </span>{" "}
              desde el periodo anterior
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tasa de Conversión</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">3.2%</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                -0.5%
              </span>{" "}
              desde el periodo anterior
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Ventas por Periodo</CardTitle>
            <CardDescription>Comparativa de ventas con el periodo anterior</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de ventas por periodo</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Ventas por Categoría</CardTitle>
            <CardDescription>Distribución de ventas por categoría de producto</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de ventas por categoría</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos por volumen de ventas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Air Jordan 1 High OG</div>
                  <div className="text-xs text-muted-foreground">124 vendidos</div>
                </div>
                <div className="font-medium">$3,999</div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Nike Dunk Low Green</div>
                  <div className="text-xs text-muted-foreground">98 vendidos</div>
                </div>
                <div className="font-medium">$2,499</div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Adidas Superstar</div>
                  <div className="text-xs text-muted-foreground">87 vendidos</div>
                </div>
                <div className="font-medium">$1,999</div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Hoodie Oversize</div>
                  <div className="text-xs text-muted-foreground">76 vendidos</div>
                </div>
                <div className="font-medium">$899</div>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Gorra Snapback</div>
                  <div className="text-xs text-muted-foreground">65 vendidos</div>
                </div>
                <div className="font-medium">$499</div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Rendimiento por Canal</CardTitle>
            <CardDescription>Ventas y conversiones por canal de adquisición</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de rendimiento por canal</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-3 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Tasa de Abandono</CardTitle>
            <CardDescription>Porcentaje de carritos abandonados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de tasa de abandono</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Valor Promedio de Pedido</CardTitle>
            <CardDescription>Valor promedio por pedido</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de valor promedio</p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Retención de Clientes</CardTitle>
            <CardDescription>Tasa de retención de clientes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de retención</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminAnalytics

