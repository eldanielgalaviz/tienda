import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ArrowDown, ArrowUp, DollarSign, Package, ShoppingCart, Users } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const AdminOverview = () => {
  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

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
              desde el mes pasado
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
              desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Productos</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+128</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-green-500 inline-flex items-center">
                <ArrowUp className="mr-1 h-3 w-3" />
                +4.3%
              </span>{" "}
              desde el mes pasado
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Clientes Activos</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">+2350</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-red-500 inline-flex items-center">
                <ArrowDown className="mr-1 h-3 w-3" />
                -1.1%
              </span>{" "}
              desde el mes pasado
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7 mt-6">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Resumen de Ventas</CardTitle>
            <CardDescription>Ventas mensuales durante el último año</CardDescription>
          </CardHeader>
          <CardContent className="pl-2">
            <div className="h-[300px] flex items-center justify-center bg-muted/20 rounded-md">
              <p className="text-muted-foreground">Gráfico de ventas mensuales</p>
            </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Productos Más Vendidos</CardTitle>
            <CardDescription>Top 5 productos por ventas</CardDescription>
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
      </div>

      <div className="grid gap-4 md:grid-cols-2 mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Pedidos Recientes</CardTitle>
            <CardDescription>Últimos 5 pedidos realizados</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#ORD-001</div>
                  <div className="text-xs text-muted-foreground">Hace 2 horas</div>
                </div>
                <Badge>Completado</Badge>
                <div className="font-medium">$4,998</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#ORD-002</div>
                  <div className="text-xs text-muted-foreground">Hace 3 horas</div>
                </div>
                <Badge>Completado</Badge>
                <div className="font-medium">$2,499</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#ORD-003</div>
                  <div className="text-xs text-muted-foreground">Hace 5 horas</div>
                </div>
                <Badge variant="outline">Procesando</Badge>
                <div className="font-medium">$3,998</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#ORD-004</div>
                  <div className="text-xs text-muted-foreground">Hace 8 horas</div>
                </div>
                <Badge variant="outline">Procesando</Badge>
                <div className="font-medium">$1,398</div>
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm font-medium">#ORD-005</div>
                  <div className="text-xs text-muted-foreground">Hace 10 horas</div>
                </div>
                <Badge variant="destructive">Cancelado</Badge>
                <div className="font-medium">$899</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Inventario Bajo</CardTitle>
            <CardDescription>Productos con stock bajo o agotado</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Vans Old Skool</div>
                  <div className="text-xs text-red-500 font-medium">Agotado</div>
                </div>
                <Button size="sm" variant="outline">
                  Reabastecer
                </Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Camiseta Básica</div>
                  <div className="text-xs text-amber-500 font-medium">5 en stock</div>
                </div>
                <Button size="sm" variant="outline">
                  Reabastecer
                </Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Air Jordan 1 Mid SE</div>
                  <div className="text-xs text-amber-500 font-medium">8 en stock</div>
                </div>
                <Button size="sm" variant="outline">
                  Reabastecer
                </Button>
              </div>
              <div className="flex items-center">
                <div className="w-10 h-10 rounded bg-muted mr-3"></div>
                <div className="flex-1">
                  <div className="text-sm font-medium">Mochila Urbana</div>
                  <div className="text-xs text-amber-500 font-medium">15 en stock</div>
                </div>
                <Button size="sm" variant="outline">
                  Reabastecer
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdminOverview

