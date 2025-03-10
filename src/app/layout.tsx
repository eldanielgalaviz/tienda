import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { ClientThemeProvider } from "@/components/providers/theme-provider";
import ClientHeader from "@/components/ClientHeader";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Fashion Treats - Sneakers y Moda Urbana",
  description: "Tu destino para sneakers de edición limitada y moda exclusiva",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className} suppressHydrationWarning>
        <ClientThemeProvider>
          <div className="min-h-screen flex flex-col">
            <ClientHeader />

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
        </ClientThemeProvider>
      </body>
    </html>
  );
}