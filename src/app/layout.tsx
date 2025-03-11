import { Inter } from 'next/font/google';
import './globals.css';
import ClientHeader from '@/components/ClientHeader';
import { CartProvider } from '@/context/CartContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Fashion Treats',
  description: 'Tu tienda de sneakers exclusivos',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <CartProvider>
          <ClientHeader />
          {children}
        </CartProvider>
      </body>
    </html>
  );
}