// src/app/api/admin/settings/route.ts
import { NextResponse } from 'next/server';
import { Pool } from 'pg';
import { getServerSession } from "next-auth";


import { authOptions } from "@/lib/auth";

// Configuración de la conexión a la base de datos
const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

// Función para verificar si el usuario tiene permisos de administrador
async function isAdmin(request) {
  const session = await getServerSession(authOptions);
  return session?.user?.isAdmin === true;
}

// GET: Obtener configuraciones actuales
export async function GET(request) {
  try {
    // Verificar permisos de administrador
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Obtener configuraciones de la base de datos
    const client = await pool.connect();
    
    try {
      // Obtener configuración general
      const generalResult = await client.query(
        `SELECT * FROM settings.general LIMIT 1`
      );
      
      // Obtener configuración SEO
      const seoResult = await client.query(
        `SELECT * FROM settings.seo LIMIT 1`
      );
      
      // Obtener métodos de envío
      const shippingMethodsResult = await client.query(
        `SELECT * FROM settings.shipping_methods`
      );
      
      // Obtener integraciones de envío
      const shippingIntegrationsResult = await client.query(
        `SELECT * FROM settings.shipping_integrations`
      );
      
      // Obtener métodos de pago
      const paymentMethodsResult = await client.query(
        `SELECT * FROM settings.payment_methods`
      );
      
      // Obtener integraciones de pago
      const paymentIntegrationsResult = await client.query(
        `SELECT * FROM settings.payment_integrations LIMIT 1`
      );
      
      // Obtener configuración de notificaciones
      const notificationsResult = await client.query(
        `SELECT * FROM settings.notifications LIMIT 1`
      );
      
      // Obtener configuración de usuarios
      const usersResult = await client.query(
        `SELECT * FROM settings.users LIMIT 1`
      );
      
      // Transformar los resultados en formato adecuado para el frontend
      const settings = {
        general: {
          storeName: generalResult.rows[0]?.store_name || "Fashion Treats",
          storeEmail: generalResult.rows[0]?.store_email || "info@fashiontreats.mx",
          storePhone: generalResult.rows[0]?.store_phone || "+52 55 1234 5678",
          storeCurrency: generalResult.rows[0]?.store_currency || "MXN",
          storeAddress: generalResult.rows[0]?.store_address || "",
          storeDescription: generalResult.rows[0]?.store_description || ""
        },
        seo: {
          metaTitle: seoResult.rows[0]?.meta_title || "",
          metaDescription: seoResult.rows[0]?.meta_description || "",
          metaKeywords: seoResult.rows[0]?.meta_keywords || ""
        },
        shipping: {
          standardShipping: {
            price: shippingMethodsResult.rows.find(m => m.code === 'standard')?.price || 150,
            enabled: shippingMethodsResult.rows.find(m => m.code === 'standard')?.is_active || true
          },
          expressShipping: {
            price: shippingMethodsResult.rows.find(m => m.code === 'express')?.price || 250,
            enabled: shippingMethodsResult.rows.find(m => m.code === 'express')?.is_active || true
          },
          storePickup: {
            price: shippingMethodsResult.rows.find(m => m.code === 'pickup')?.price || 0,
            enabled: shippingMethodsResult.rows.find(m => m.code === 'pickup')?.is_active || true
          },
          integrations: {
            estafeta: shippingIntegrationsResult.rows.find(i => i.provider === 'estafeta')?.is_active || false,
            dhl: shippingIntegrationsResult.rows.find(i => i.provider === 'dhl')?.is_active || false,
            fedex: shippingIntegrationsResult.rows.find(i => i.provider === 'fedex')?.is_active || false
          }
        },
        payment: {
          methods: {
            cards: paymentMethodsResult.rows.find(m => m.code === 'cards')?.is_active || true,
            oxxo: paymentMethodsResult.rows.find(m => m.code === 'oxxo')?.is_active || true,
            transfer: paymentMethodsResult.rows.find(m => m.code === 'transfer')?.is_active || true,
            paypal: paymentMethodsResult.rows.find(m => m.code === 'paypal')?.is_active || false
          },
          mercadoPagoKey: paymentIntegrationsResult.rows[0]?.mercado_pago_key || "",
          conektaKey: paymentIntegrationsResult.rows[0]?.conekta_key || "",
          stripeKey: paymentIntegrationsResult.rows[0]?.stripe_key || ""
        },
        notifications: {
          welcome: notificationsResult.rows[0]?.welcome_email || true,
          orderConfirmation: notificationsResult.rows[0]?.order_confirmation || true,
          shippingUpdate: notificationsResult.rows[0]?.shipping_update || true,
          abandonedCart: notificationsResult.rows[0]?.abandoned_cart || true,
          newsletter: notificationsResult.rows[0]?.newsletter || true,
          smtpHost: notificationsResult.rows[0]?.smtp_host || "smtp.gmail.com",
          smtpPort: notificationsResult.rows[0]?.smtp_port || "587",
          smtpSecurity: notificationsResult.rows[0]?.smtp_security || "TLS",
          smtpUser: notificationsResult.rows[0]?.smtp_user || "",
          smtpPassword: notificationsResult.rows[0]?.smtp_password || ""
        },
        users: {
          sessionTimeout: usersResult.rows[0]?.session_timeout || 60,
          security: {
            twoFactor: usersResult.rows[0]?.two_factor || false,
            accountLock: usersResult.rows[0]?.account_lock || true,
            passwordPolicy: usersResult.rows[0]?.password_policy || true
          }
        }
      };
      
      return NextResponse.json({ settings });
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al obtener la configuración:', error);
    return NextResponse.json(
      { error: 'Error al obtener la configuración' },
      { status: 500 }
    );
  }
}

// PATCH: Actualizar configuraciones
export async function PATCH(request) {
  try {
    // Verificar permisos de administrador
    if (!(await isAdmin(request))) {
      return NextResponse.json(
        { error: 'Acceso no autorizado' },
        { status: 403 }
      );
    }

    // Obtener datos de la solicitud
    const data = await request.json();
    const settings = data.settings || data; // Permitir ambos formatos
    
    // Obtener cliente de base de datos para la transacción
    const client = await pool.connect();
    
    try {
      await client.query('BEGIN');
      
      // Actualizar configuración general
      if (settings.general) {
        await client.query(`
          INSERT INTO settings.general (
            store_name, store_email, store_phone, store_currency, 
            store_address, store_description, updated_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            store_name = $1,
            store_email = $2,
            store_phone = $3,
            store_currency = $4,
            store_address = $5,
            store_description = $6,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.general.storeName,
          settings.general.storeEmail,
          settings.general.storePhone,
          settings.general.storeCurrency,
          settings.general.storeAddress,
          settings.general.storeDescription
        ]);
      }
      
      // Actualizar configuración SEO
      if (settings.seo) {
        await client.query(`
          INSERT INTO settings.seo (
            meta_title, meta_description, meta_keywords, updated_at
          ) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            meta_title = $1,
            meta_description = $2,
            meta_keywords = $3,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.seo.metaTitle,
          settings.seo.metaDescription,
          settings.seo.metaKeywords
        ]);
      }
      
      // Actualizar métodos de envío
      if (settings.shipping) {
        // Actualizar envío estándar
        await client.query(`
          INSERT INTO settings.shipping_methods (
            code, name, price, is_active, updated_at
          ) 
          VALUES ('standard', 'Envío Estándar', $1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            price = $1,
            is_active = $2,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.shipping.standardShipping.price,
          settings.shipping.standardShipping.enabled
        ]);
        
        // Actualizar envío express
        await client.query(`
          INSERT INTO settings.shipping_methods (
            code, name, price, is_active, updated_at
          ) 
          VALUES ('express', 'Envío Express', $1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            price = $1,
            is_active = $2,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.shipping.expressShipping.price,
          settings.shipping.expressShipping.enabled
        ]);
        
        // Actualizar recogida en tienda
        await client.query(`
          INSERT INTO settings.shipping_methods (
            code, name, price, is_active, updated_at
          ) 
          VALUES ('pickup', 'Recogida en Tienda', $1, $2, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            price = $1,
            is_active = $2,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.shipping.storePickup.price,
          settings.shipping.storePickup.enabled
        ]);
        
        // Actualizar integraciones de envío
        if (settings.shipping.integrations) {
          // Estafeta
          await client.query(`
            INSERT INTO settings.shipping_integrations (
              provider, is_active, updated_at
            ) 
            VALUES ('estafeta', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (provider) DO UPDATE SET
              is_active = $1,
              updated_at = CURRENT_TIMESTAMP
          `, [settings.shipping.integrations.estafeta]);
          
          // DHL
          await client.query(`
            INSERT INTO settings.shipping_integrations (
              provider, is_active, updated_at
            ) 
            VALUES ('dhl', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (provider) DO UPDATE SET
              is_active = $1,
              updated_at = CURRENT_TIMESTAMP
          `, [settings.shipping.integrations.dhl]);
          
          // FedEx
          await client.query(`
            INSERT INTO settings.shipping_integrations (
              provider, is_active, updated_at
            ) 
            VALUES ('fedex', $1, CURRENT_TIMESTAMP)
            ON CONFLICT (provider) DO UPDATE SET
              is_active = $1,
              updated_at = CURRENT_TIMESTAMP
          `, [settings.shipping.integrations.fedex]);
        }
      }
      
      // Actualizar métodos de pago
      if (settings.payment) {
        // Actualizar tarjetas
        await client.query(`
          INSERT INTO settings.payment_methods (
            code, name, is_active, updated_at
          ) 
          VALUES ('cards', 'Tarjetas de Crédito/Débito', $1, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        `, [settings.payment.methods.cards]);
        
        // Actualizar OXXO
        await client.query(`
          INSERT INTO settings.payment_methods (
            code, name, is_active, updated_at
          ) 
          VALUES ('oxxo', 'OXXO', $1, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        `, [settings.payment.methods.oxxo]);
        
        // Actualizar transferencia
        await client.query(`
          INSERT INTO settings.payment_methods (
            code, name, is_active, updated_at
          ) 
          VALUES ('transfer', 'Transferencia Bancaria', $1, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        `, [settings.payment.methods.transfer]);
        
        // Actualizar PayPal
        await client.query(`
          INSERT INTO settings.payment_methods (
            code, name, is_active, updated_at
          ) 
          VALUES ('paypal', 'PayPal', $1, CURRENT_TIMESTAMP)
          ON CONFLICT (code) DO UPDATE SET
            is_active = $1,
            updated_at = CURRENT_TIMESTAMP
        `, [settings.payment.methods.paypal]);
        
        // Actualizar integraciones de pago
        await client.query(`
          INSERT INTO settings.payment_integrations (
            mercado_pago_key, conekta_key, stripe_key, updated_at
          ) 
          VALUES ($1, $2, $3, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            mercado_pago_key = $1,
            conekta_key = $2,
            stripe_key = $3,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.payment.mercadoPagoKey,
          settings.payment.conektaKey,
          settings.payment.stripeKey
        ]);
      }
      
      // Actualizar notificaciones
      if (settings.notifications) {
        await client.query(`
          INSERT INTO settings.notifications (
            welcome_email, order_confirmation, shipping_update, 
            abandoned_cart, newsletter, smtp_host, smtp_port, 
            smtp_security, smtp_user, smtp_password, updated_at
          ) 
          VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            welcome_email = $1,
            order_confirmation = $2,
            shipping_update = $3,
            abandoned_cart = $4,
            newsletter = $5,
            smtp_host = $6,
            smtp_port = $7,
            smtp_security = $8,
            smtp_user = $9,
            smtp_password = $10,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.notifications.welcome,
          settings.notifications.orderConfirmation,
          settings.notifications.shippingUpdate,
          settings.notifications.abandonedCart,
          settings.notifications.newsletter,
          settings.notifications.smtpHost,
          settings.notifications.smtpPort,
          settings.notifications.smtpSecurity,
          settings.notifications.smtpUser,
          settings.notifications.smtpPassword
        ]);
      }
      
      // Actualizar configuración de usuarios
      if (settings.users) {
        await client.query(`
          INSERT INTO settings.users (
            session_timeout, two_factor, account_lock, 
            password_policy, updated_at
          ) 
          VALUES ($1, $2, $3, $4, CURRENT_TIMESTAMP)
          ON CONFLICT (id) DO UPDATE SET
            session_timeout = $1,
            two_factor = $2,
            account_lock = $3,
            password_policy = $4,
            updated_at = CURRENT_TIMESTAMP
        `, [
          settings.users.sessionTimeout,
          settings.users.security.twoFactor,
          settings.users.security.accountLock,
          settings.users.security.passwordPolicy
        ]);
      }
      
      await client.query('COMMIT');
      
      return NextResponse.json({ 
        success: true,
        message: 'Configuración actualizada correctamente'
      });
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  } catch (error) {
    console.error('Error al actualizar la configuración:', error);
    return NextResponse.json(
      { error: 'Error al actualizar la configuración', details: error.message },
      { status: 500 }
    );
  }
}