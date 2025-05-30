"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { Search, User, ShoppingCart, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useCart } from "@/hooks/use-cart"

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  const { items } = useCart()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        isScrolled ? "bg-white shadow-md py-2" : "bg-white/80 backdrop-blur-sm py-4",
      )}
    >
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center">
            <div className="bg-black p-2 mr-2">
              <span className="text-white font-bold text-xl">ft</span>
            </div>
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-none">FASHION</span>
              <span className="font-bold text-lg leading-none">TREATS</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link to="/" className="font-medium hover:text-gray-600 transition-colors">
              Inicio
            </Link>
            <Link to="/tienda" className="font-medium hover:text-gray-600 transition-colors">
              Tienda
            </Link>
            <Link to="/tienda?categoria=sneakers" className="font-medium hover:text-gray-600 transition-colors">
              Sneakers
            </Link>
            <Link to="/tienda?categoria=ropa" className="font-medium hover:text-gray-600 transition-colors">
              Ropa
            </Link>
            <Link to="/tienda?categoria=accesorios" className="font-medium hover:text-gray-600 transition-colors">
              Accesorios
            </Link>
            <Link to="/contacto" className="font-medium hover:text-gray-600 transition-colors">
              Contacto
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="icon" aria-label="Buscar">
              <Search className="h-5 w-5" />
            </Button>
            <Link to="/login">
              <Button variant="ghost" className="hidden md:flex items-center gap-2">
                <User className="h-5 w-5" />
                <span>Iniciar Sesión</span>
              </Button>
            </Link>
            <Link to="/carrito" className="relative">
              <Button variant="ghost" size="icon" aria-label="Carrito">
                <ShoppingCart className="h-5 w-5" />
                {items.length > 0 && (
                  <span className="absolute -top-1 -right-1 bg-black text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                    {items.length}
                  </span>
                )}
              </Button>
            </Link>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label={isMobileMenuOpen ? "Cerrar menú" : "Abrir menú"}
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden pt-4 pb-2">
            <nav className="flex flex-col space-y-4">
              <Link
                to="/"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Inicio
              </Link>
              <Link
                to="/tienda"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Tienda
              </Link>
              <Link
                to="/tienda?categoria=sneakers"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Sneakers
              </Link>
              <Link
                to="/tienda?categoria=ropa"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Ropa
              </Link>
              <Link
                to="/tienda?categoria=accesorios"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Accesorios
              </Link>
              <Link
                to="/contacto"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Contacto
              </Link>
              <Link
                to="/login"
                className="font-medium py-2 hover:bg-gray-100 px-2 rounded"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Iniciar Sesión
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}

export default Navbar

