import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configuración robusta del entorno
const configurePaypal = () => {
  const clientId = process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  if (!clientId || !clientSecret) {
    throw new Error('PayPal credentials not configured');
  }

  return new paypal.core.SandboxEnvironment(clientId, clientSecret);
};

export async function POST(request: Request) {
  try {
    // Verificar método HTTP
    if (request.method !== 'POST') {
      return NextResponse.json(
        { error: 'Method not allowed' },
        { status: 405 }
      );
    }

    // Configurar cliente PayPal
    const client = new paypal.core.PayPalHttpClient(configurePaypal());

    // Parsear y validar el cuerpo
    const { amount } = await request.json();
    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      );
    }

    // Crear solicitud de orden
    const orderRequest = new paypal.orders.OrdersCreateRequest();
    orderRequest.headers['Prefer'] = 'return=representation';
    orderRequest.requestBody({
      intent: 'CAPTURE',
      purchase_units: [{
        amount: {
          currency_code: 'MXN',
          value: amountNumber.toFixed(2)
        }
      }]
    });

    // Ejecutar y validar respuesta
    const response = await client.execute(orderRequest);
    
    if (!response?.result?.id) {
      throw new Error('Invalid PayPal response structure');
    }

    return NextResponse.json({
      success: true,
      orderID: response.result.id,
      status: response.result.status,
      links: response.result.links
    });

  } catch (error: any) {
    console.error('Detailed PayPal Error:', {
      message: error.message,
      stack: error.stack,
      raw: error
    });
    
    return NextResponse.json(
      {
        error: 'Payment processing failed',
        details: error.message,
        type: 'PAYPAL_API_ERROR'
      },
      { status: 500 }
    );
  }
}