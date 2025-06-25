import { NextResponse } from 'next/server';
import { MercadoPagoConfig } from 'mercadopago';

// Configurar el cliente con el nuevo SDK
const client = new MercadoPagoConfig({
  accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN || '',
});

export async function POST(request: Request) {
  try {
    const { items, total } = await request.json();

    const preference = {
      items: items.map((item: any) => ({
        title: item.name,
        unit_price: parseFloat(item.price),
        quantity: item.quantity,
        currency_id: 'MXN',
      })),
      back_urls: {
        success: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/success`,
        failure: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/failure`,
        pending: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout/pending`,
      },
      auto_return: 'approved',
      payment_methods: {
        installments: 12,
      },
      metadata: {
        total_amount: total,
      },
    };

    // Crear preferencia con el nuevo método del cliente
    const response = await client.preference.create({ body: preference });

    return NextResponse.json({
      preferenceId: response.id,
      checkoutUrl: response.init_point,
    });
  } catch (error: any) {
    console.error('Error creating Mercado Pago preference:', error);
    return NextResponse.json(
      { error: error.message || 'Error al crear preferencia de pago' },
      { status: 500 }
    );
  }
}
