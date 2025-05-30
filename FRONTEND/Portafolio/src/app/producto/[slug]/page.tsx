"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { useParams } from "next/navigation";
import { Loader2, ShoppingCart, Heart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart } from "@/context/CartContext";

export default function ProductPage() {
  const params = useParams();
  const { slug } = params;
  
  const [product, setProduct] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  
  // Obtener la función addToCart del contexto
  const { addToCart } = useCart();
  
  // Cargar detalles del producto
  useEffect(() => {
    const fetchProductDetails = async () => {
      try {
        setIsLoading(true);
        
        // Realizar la consulta a la API para obtener los detalles del producto por slug
        const response = await fetch(`/api/products/detail?slug=${slug}`);
        
        if (!response.ok) {
          throw new Error('Error al cargar detalles del producto');
        }
        
        const data = await response.json();
        setProduct(data.product);
      } catch (error) {
        console.error('Error fetching product details:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (slug) {
      fetchProductDetails();
    }
  }, [slug]);
  
  // Formatear precio
  const formatPrice = (price) => {
    if (!price) return "$0";
    return parseFloat(price).toLocaleString('es-MX', {
      style: 'currency',
      currency: 'MXN',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    });
  };
  
  // Manejar cambio de cantidad
  const handleQuantityChange = (value) => {
    const newQuantity = quantity + value;
    if (newQuantity > 0 && newQuantity <= (product?.stock || 10)) {
      setQuantity(newQuantity);
    }
  };
  
  // Manejar añadir al carrito
  const handleAddToCart = () => {
    // Usar la función addToCart del contexto para agregar el producto
    addToCart(product, quantity);
    alert(`${product.name} añadido al carrito (${quantity} unidades)`);
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-16 flex justify-center items-center">
        <Loader2 className="h-8 w-8 animate-spin mr-2" />
        <span>Cargando producto...</span>
      </div>
    );
  }
  
  if (!product) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-2xl font-bold mb-4">Producto no encontrado</h1>
        <p className="text-gray-600 mb-8">
          Lo sentimos, no pudimos encontrar el producto que estás buscando.
        </p>
        <a
          href="/tienda"
          className="inline-block bg-black text-white px-6 py-3 rounded-md font-medium hover:bg-gray-800 transition-colors"
        >
          Volver a la tienda
        </a>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Galería de imágenes */}
        <div>
          <div className="relative aspect-square bg-gray-100 rounded-lg overflow-hidden mb-4">
            {product.images && product.images.length > 0 ? (
              <Image
                src={product.images[selectedImage]?.image_url || product.images[0]?.image_url}
                alt={product.name}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 50vw"
                style={{ objectFit: "contain" }}
              />
            ) : (
              <div className="absolute inset-0 flex items-center justify-center text-gray-400">
                Imagen no disponible
              </div>
            )}
          </div>
          
          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="grid grid-cols-5 gap-2">
              {product.images.map((image, index) => (
                <button 
                  key={index}
                  onClick={() => setSelectedImage(index)}
                  className={`relative aspect-square bg-gray-100 rounded overflow-hidden border-2 ${
                    selectedImage === index ? 'border-black' : 'border-transparent'
                  }`}
                >
                  <Image
                    src={image.image_url}
                    alt={`${product.name} - Imagen ${index + 1}`}
                    fill
                    sizes="20vw"
                    style={{ objectFit: "cover" }}
                  />
                </button>
              ))}
            </div>
          )}
        </div>
        
        {/* Información del producto */}
        <div>
          {/* Marca */}
          {product.brand_name && (
            <p className="text-gray-500 mb-1">{product.brand_name}</p>
          )}
          
          {/* Nombre del producto */}
          <h1 className="text-3xl font-bold mb-4">{product.name}</h1>
          
          {/* Precio */}
          <div className="mb-6">
            {product.compare_at_price && parseFloat(product.compare_at_price) > parseFloat(product.price) ? (
              <div className="flex items-center">
                <span className="text-2xl font-bold mr-2">{formatPrice(product.price)}</span>
                <span className="text-lg text-gray-500 line-through">
                  {formatPrice(product.compare_at_price)}
                </span>
                <span className="ml-2 bg-red-600 text-white text-xs font-bold px-2 py-1 rounded">
                  {Math.round((1 - parseFloat(product.price) / parseFloat(product.compare_at_price)) * 100)}% OFF
                </span>
              </div>
            ) : (
              <span className="text-2xl font-bold">{formatPrice(product.price)}</span>
            )}
          </div>
          
          {/* Descripción */}
          {product.description && (
            <div className="mb-6">
              <h2 className="text-lg font-semibold mb-2">Descripción</h2>
              <p className="text-gray-700">{product.description}</p>
            </div>
          )}
          
          {/* Selector de cantidad */}
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-2">Cantidad</h2>
            <div className="flex items-center">
              <button 
                onClick={() => handleQuantityChange(-1)}
                className="w-10 h-10 border rounded-l flex items-center justify-center hover:bg-gray-100"
              >
                -
              </button>
              <div className="w-14 h-10 border-t border-b flex items-center justify-center">
                {quantity}
              </div>
              <button 
                onClick={() => handleQuantityChange(1)}
                className="w-10 h-10 border rounded-r flex items-center justify-center hover:bg-gray-100"
              >
                +
              </button>
              
              <span className="ml-4 text-sm text-gray-500">
                {product.stock ? `${product.stock} disponibles` : 'Disponible'}
              </span>
            </div>
          </div>
          
          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Button 
              className="flex-1 h-12 bg-black hover:bg-gray-800 text-white"
              onClick={handleAddToCart}
            >
              <ShoppingCart className="mr-2 h-5 w-5" />
              Añadir al carrito
            </Button>
            
            <Button 
              variant="outline" 
              className="flex-1 h-12 border-gray-300"
            >
              <Heart className="mr-2 h-5 w-5" />
              Añadir a favoritos
            </Button>
          </div>
          
          {/* Detalles adicionales */}
          <div className="mt-8 border-t pt-6">
            <div className="grid grid-cols-2 gap-4">
              {product.sku && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">SKU</h3>
                  <p>{product.sku}</p>
                </div>
              )}
              
              {product.category_name && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500">Categoría</h3>
                  <p>{product.category_name}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}