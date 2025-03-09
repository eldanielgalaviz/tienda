import type React from "react"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/providers/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import "./globals.css"

const inter = Inter({ subsets: ["latin"] })


export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
        <div className="min-h-screen flex flex-col" suppressHydrationWarning>
            <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="container mx-auto px-4">
                <div className="flex h-16 items-center justify-between">
                  <a href="/" className="font-bold text-xl">
                    Fashion Treats
                  </a>

                  <nav className="hidden md:flex items-center gap-6">
                    <a href="/tienda" className="hover:text-gray-600 transition-colors">
                      Tienda
                    </a>
                    <a href="/nuevo" className="hover:text-gray-600 transition-colors">
                      Nuevo
                    </a>
                    <a href="/marcas" className="hover:text-gray-600 transition-colors">
                      Marcas
                    </a>
                    <a href="/sale" className="hover:text-gray-600 transition-colors">
                      Sale
                    </a>
                  </nav>

                  <div className="flex items-center gap-4">
                    <a href="/buscar" className="hover:text-gray-600 transition-colors">
                      Buscar
                    </a>
                    <a href="/cuenta" className="hover:text-gray-600 transition-colors">
                      Cuenta
                    </a>
                    <a href="/carrito" className="hover:text-gray-600 transition-colors">
                      Carrito (0)
                    </a>
                  </div>
                </div>
              </div>
            </header>

            {children}

            <footer className="mt-auto border-t">
              <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                  <div>
                    <h3 className="font-bold mb-4">Fashion Treats</h3>
                    <p className="text-sm text-gray-600">
                      Tu destino para sneakers de edición limitada y moda exclusiva
                    </p>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">Enlaces</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/sobre-nosotros" className="hover:underline">
                          Sobre Nosotros
                        </a>
                      </li>
                      <li>
                        <a href="/blog" className="hover:underline">
                          Blog
                        </a>
                      </li>
                      <li>
                        <a href="/tiendas" className="hover:underline">
                          Tiendas
                        </a>
                      </li>
                      <li>
                        <a href="/contacto" className="hover:underline">
                          Contacto
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">Ayuda</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/envios" className="hover:underline">
                          Envíos
                        </a>
                      </li>
                      <li>
                        <a href="/devoluciones" className="hover:underline">
                          Devoluciones
                        </a>
                      </li>
                      <li>
                        <a href="/faqs" className="hover:underline">
                          FAQs
                        </a>
                      </li>
                      <li>
                        <a href="/size-guide" className="hover:underline">
                          Guía de Tallas
                        </a>
                      </li>
                    </ul>
                  </div>

                  <div>
                    <h3 className="font-bold mb-4">Legal</h3>
                    <ul className="space-y-2 text-sm">
                      <li>
                        <a href="/privacidad" className="hover:underline">
                          Privacidad
                        </a>
                      </li>
                      <li>
                        <a href="/terminos" className="hover:underline">
                          Términos
                        </a>
                      </li>
                      <li>
                        <a href="/cookies" className="hover:underline">
                          Cookies
                        </a>
                      </li>
                    </ul>
                  </div>
                </div>

                <div className="mt-8 pt-8 border-t text-center text-sm text-gray-600">
                  <p>&copy; {new Date().getFullYear()} Fashion Treats. Todos los derechos reservados.</p>
                </div>
              </div>
            </footer>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  )
}

