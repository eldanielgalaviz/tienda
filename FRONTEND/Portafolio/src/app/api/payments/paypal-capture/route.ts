// src/app/api/payments/paypal-capture/route.ts
import { NextResponse } from 'next/server';
import paypal from '@paypal/checkout-server-sdk';

// Configuración de las credenciales de PayPal
const environment = new paypal.core.SandboxEnvironment(
  process.env.PAYPAL_CLIENT_ID || '',
  process.env.PAYPAL_SECRET || ''
);
const client = new paypal.core.PayPalHttpClient(environment);

export async function POST(request: Request) {
  try {
    // Parsear el cuerpo de la solicitud
    const { orderID } = await request.json();

    // Validar que se proporcione un orderID
    if (!orderID) {
      return NextResponse.json(
        { error: 'Order ID es requerido' }, 
        { status: 400 }
      );
    }

    // Crear la solicitud de captura de la orden
    const captureRequest = new paypal.orders.OrdersCaptureRequest(orderID);
    captureRequest.requestBody({});

    // Ejecutar la captura
    const capture = await client.execute(captureRequest);

    // Verificar el estado de la captura
    if (capture.result.status !== 'COMPLETED') {
      return NextResponse.json(
        { error: 'Pago no completado' }, 
        { status: 400 }
      );
    }

    // Devolver detalles de la captura
    return NextResponse.json({ 
      status: 'COMPLETED', 
      details: capture.result 
    });

  } catch (error: any) {
    console.error('Error en la captura de pago de PayPal:', error);
    return NextResponse.json(
      { 
        error: 'Error al capturar el pago de PayPal', 
        details: error.message 
      }, 
      { status: 500 }
    );
  }
}