import { Link } from "react-router-dom"
import { Facebook, Instagram, Twitter } from "lucide-react"

const Footer = () => {
  return (
    <footer className="bg-black text-white pt-12 pb-6">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <h3 className="text-lg font-bold mb-4">FASHION TREATS</h3>
            <p className="text-gray-300 mb-4">Tu destino para moda exclusiva y sneakers de edición limitada.</p>
            <div className="flex space-x-4">
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Facebook className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Instagram className="h-5 w-5" />
              </a>
              <a href="#" className="text-white hover:text-gray-300 transition-colors">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Categorías</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/tienda?categoria=sneakers" className="text-gray-300 hover:text-white transition-colors">
                  Sneakers
                </Link>
              </li>
              <li>
                <Link to="/tienda?categoria=ropa" className="text-gray-300 hover:text-white transition-colors">
                  Ropa
                </Link>
              </li>
              <li>
                <Link to="/tienda?categoria=accesorios" className="text-gray-300 hover:text-white transition-colors">
                  Accesorios
                </Link>
              </li>
              <li>
                <Link to="/tienda?etiqueta=nuevo" className="text-gray-300 hover:text-white transition-colors">
                  Nuevos Lanzamientos
                </Link>
              </li>
              <li>
                <Link to="/tienda?etiqueta=oferta" className="text-gray-300 hover:text-white transition-colors">
                  Ofertas
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Ayuda</h3>
            <ul className="space-y-2">
              <li>
                <Link to="/cuenta/pedidos" className="text-gray-300 hover:text-white transition-colors">
                  Seguimiento de Pedidos
                </Link>
              </li>
              <li>
                <Link to="/envios" className="text-gray-300 hover:text-white transition-colors">
                  Envíos
                </Link>
              </li>
              <li>
                <Link to="/devoluciones" className="text-gray-300 hover:text-white transition-colors">
                  Devoluciones
                </Link>
              </li>
              <li>
                <Link to="/preguntas-frecuentes" className="text-gray-300 hover:text-white transition-colors">
                  Preguntas Frecuentes
                </Link>
              </li>
              <li>
                <Link to="/contacto" className="text-gray-300 hover:text-white transition-colors">
                  Contacto
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-4">Contacto</h3>
            <address className="not-italic text-gray-300 space-y-2">
              <p>Ciudad de México, México</p>
              <p>Email: info@fashiontreats.mx</p>
              <p>Teléfono: +52 55 1234 5678</p>
            </address>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-gray-400 text-sm">
              &copy; {new Date().getFullYear()} Fashion Treats. Todos los derechos reservados.
            </p>
            <div className="flex space-x-4 mt-4 md:mt-0">
              <Link to="/terminos" className="text-gray-400 text-sm hover:text-white transition-colors">
                Términos y Condiciones
              </Link>
              <Link to="/privacidad" className="text-gray-400 text-sm hover:text-white transition-colors">
                Política de Privacidad
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}

export default Footer

