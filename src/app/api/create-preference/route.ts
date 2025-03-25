//src/app/api/create-preference/route.ts
import { NextResponse } from 'next/server';
import { MercadoPagoConfig, Preference } from 'mercadopago';
import { v4 as uuidv4 } from 'uuid';
import { Pool } from 'pg';

const pool = new Pool({
  connectionString: process.env.DATABASE_URL
});

export async function POST(request: Request) {
  const client = new MercadoPagoConfig({
    accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || ''
  });

  const preference = new Preference(client);

  try {
    // Obtener datos del carrito
    const { items, total, user_id } = await request.json();

    // Validar que los items tengan product_id
    const validatedItems = items.map(item => ({
      ...item,
      product_id: item.product_id || null,
      variant_id: item.variant_id || null
    }));

    // Verificar si hay items válidos
    if (validatedItems.length === 0) {
      return NextResponse.json(
        { error: 'No hay items válidos en el carrito' },
        { status: 400 }
      );
    }

    // Generar número de orden
    const orderNumber = `FT-${Date.now()}`;

    // Iniciar transacción de base de datos para crear orden preliminar
    const dbClient = await pool.connect();

    try {
      await dbClient.query('BEGIN');

      // Obtener ID de estado pendiente
      const statusResult = await dbClient.query(
        'SELECT id FROM orders.order_statuses WHERE name = $1',
        ['Pendiente']
      );
      const statusId = statusResult.rows[0].id;

      // Calcular subtotal, impuestos, etc.
      const subtotal = validatedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
      const tax = subtotal * 0.16; // IVA del 16%
      const shippingCost = 0; // Ajusta según tu lógica de envío

      // Crear orden preliminar
      const orderResult = await dbClient.query(
        `INSERT INTO orders.orders (
          order_number, 
          user_id, 
          status_id, 
          subtotal, 
          tax, 
          shipping_cost, 
          total, 
          payment_method, 
          payment_status
        ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING id`,
        [
          orderNumber,
          user_id,
          statusId,
          subtotal,
          tax,
          shippingCost,
          total,
          'Mercado Pago',
          'pendiente'
        ]
      );

      const orderId = orderResult.rows[0].id;

      // Insertar items de la orden con validación
      for (const item of validatedItems) {
        await dbClient.query(
          `INSERT INTO orders.order_items (
            order_id, 
            product_id, 
            variant_id, 
            quantity, 
            price, 
            total
          ) VALUES ($1, $2, $3, $4, $5, $6)`,
          [
            orderId,
            item.product_id,  // Añadido para asegurar que no sea nulo
            item.variant_id,  // Puede ser nulo
            item.quantity,
            item.price,
            item.price * item.quantity
          ]
        );
      }

      await dbClient.query('COMMIT');

      // Crear preferencia de pago
      const response = await preference.create({
        body: {
          items: validatedItems.map((item: any) => ({
            title: item.name,
            unit_price: parseFloat(item.price),
            quantity: item.quantity,
            currency_id: 'MXN'
          })),
          back_urls: {
            success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success/${orderNumber}`,
            failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failure/${orderNumber}`,
            pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending/${orderNumber}`
          },
          notification_url: `${process.env.NEXT_PUBLIC_SITE_URL}/api/webhooks/mercadopago`,
          auto_return: 'approved',
          external_reference: orderNumber,
          payment_methods: {
            installments: 12
          }
        }
      });

      return NextResponse.json({
        preferenceId: response.id,
        checkoutUrl: response.init_point,
        orderNumber: orderNumber
      });
    } catch (error) {
      await dbClient.query('ROLLBACK');
      console.error('Error creating order:', error);
      return NextResponse.json(
        { error: 'Error al crear la orden preliminar', details: error.message },
        { status: 500 }
      );
    } finally {
      dbClient.release();
    }
  } catch (error) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json(
      { error: error.message || "Error al crear preferencia de pago" },
      { status: 500 }
    );
  }
}