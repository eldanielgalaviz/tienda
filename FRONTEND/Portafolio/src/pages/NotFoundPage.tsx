import Link from "next/link"
import { Button } from "@/components/ui/button"

const NotFoundPage = () => {
  return (
    <div className="container mx-auto px-4 py-24 text-center">
      <div className="max-w-md mx-auto">
        <h1 className="text-9xl font-bold text-gray-200">404</h1>
        <h2 className="text-2xl font-bold mb-4">Página no encontrada</h2>
        <p className="text-gray-600 mb-8">Lo sentimos, la página que estás buscando no existe o ha sido movida.</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild>
            <Link href="/">Volver al Inicio</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/tienda">Ir a la Tienda</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage
