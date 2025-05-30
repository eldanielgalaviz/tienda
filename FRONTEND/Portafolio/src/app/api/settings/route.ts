// src/app/api/settings/route.ts
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

// Ruta al archivo de configuración
const configFilePath = path.join(process.cwd(), 'config', 'settings.json');

// Función para asegurar que el directorio de configuración existe
function ensureConfigDir() {
  const configDir = path.join(process.cwd(), 'config');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
}

// Función para cargar configuraciones
function loadSettings() {
  try {
    if (!fs.existsSync(configFilePath)) {
      return getDefaultSettings();
    }
    const data = fs.readFileSync(configFilePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error loading settings:', error);
    return getDefaultSettings();
  }
}

// Función para guardar configuraciones
function saveSettings(settings) {
  try {
    ensureConfigDir();
    fs.writeFileSync(configFilePath, JSON.stringify(settings, null, 2), 'utf8');
    return true;
  } catch (error) {
    console.error('Error saving settings:', error);
    return false;
  }
}

// Configuraciones por defecto
function getDefaultSettings() {
  return {
    general: {
      storeName: "Fashion Treats",
      storeEmail: "info@fashiontreats.mx",
      storePhone: "+52 55 1234 5678",
      storeCurrency: "MXN",
      storeAddress: "Calle Principal 123, Ciudad de México, CDMX, 01000, México",
      storeDescription: "Fashion Treats es tu destino para moda exclusiva y sneakers de edición limitada."
    },
    seo: {
      metaTitle: "Fashion Treats | Sneakers y Moda Exclusiva",
      metaDescription: "Fashion Treats es tu destino para sneakers de edición limitada y moda exclusiva en México. Envíos gratis a todo el país.",
      metaKeywords: "sneakers, moda, ropa, accesorios, zapatillas, México"
    },
    shipping: {
      standardShipping: {
        price: 150,
        enabled: true
      },
      expressShipping: {
        price: 250,
        enabled: true
      },
      storePickup: {
        price: 0,
        enabled: true
      },
      integrations: {
        estafeta: true,
        dhl: false,
        fedex: false
      }
    },
    payment: {
      methods: {
        cards: true,
        oxxo: true,
        transfer: true,
        paypal: false
      },
      mercadoPagoKey: process.env.MERCADO_PAGO_ACCESS_TOKEN || "••••••••••••••••",
      conektaKey: process.env.CONEKTA_API_KEY || "••••••••••••••••",
      stripeKey: process.env.STRIPE_SECRET_KEY || "••••••••••••••••"
    },
    notifications: {
      welcome: true,
      orderConfirmation: true,
      shippingUpdate: true,
      abandonedCart: true,
      newsletter: true,
      smtpHost: "smtp.gmail.com",
      smtpPort: "587",
      smtpSecurity: "TLS",
      smtpUser: "info@fashiontreats.mx",
      smtpPassword: "••••••••••••••••"
    },
    users: {
      sessionTimeout: 60,
      security: {
        twoFactor: false,
        accountLock: true,
        passwordPolicy: true
      }
    }
  };
}

// Manejador GET - Obtener configuraciones
export async function GET(request) {
  // Aquí podrías implementar verificación de autenticación/autorización
  // Por ejemplo, verificar que el usuario es admin

  const settings = loadSettings();
  
  return NextResponse.json({ settings });
}

// Manejador POST - Guardar configuraciones
export async function POST(request) {
  try {
    // Aquí podrías implementar verificación de autenticación/autorización
    
    const body = await request.json();
    const { settings } = body;
    
    if (!settings) {
      return NextResponse.json(
        { error: 'No se proporcionaron configuraciones' },
        { status: 400 }
      );
    }

    // Procesar y guardar las claves de API si han cambiado
    // Nota: En un entorno de producción, estas claves deberían guardarse de forma segura
    // y no en un archivo local
    if (settings.payment) {
      // Solo actualizar si la clave ha cambiado (no es el valor con asteriscos)
      if (settings.payment.mercadoPagoKey && !settings.payment.mercadoPagoKey.startsWith('••••')) {
        // En un entorno real, aquí actualizarías la clave de forma segura
        console.log('Nueva clave de Mercado Pago recibida');
        
        // Para este ejemplo, simplemente la ocultamos antes de guardarla
        settings.payment.mercadoPagoKey = "••••••••••••••••";
      }
      
      if (settings.payment.conektaKey && !settings.payment.conektaKey.startsWith('••••')) {
        console.log('Nueva clave de Conekta recibida');
        settings.payment.conektaKey = "••••••••••••••••";
      }
      
      if (settings.payment.stripeKey && !settings.payment.stripeKey.startsWith('••••')) {
        console.log('Nueva clave de Stripe recibida');
        settings.payment.stripeKey = "••••••••••••••••";
      }
    }

    // Lo mismo para la contraseña SMTP
    if (settings.notifications && settings.notifications.smtpPassword && 
        !settings.notifications.smtpPassword.startsWith('••••')) {
      console.log('Nueva contraseña SMTP recibida');
      settings.notifications.smtpPassword = "••••••••••••••••";
    }
    
    const success = saveSettings(settings);
    
    if (!success) {
      throw new Error('Error al guardar configuraciones');
    }
    
    return NextResponse.json({ 
      success: true,
      message: 'Configuración guardada correctamente'
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { 
        error: 'Error al guardar la configuración',
        details: error.message
      },
      { status: 500 }
    );
  }
}