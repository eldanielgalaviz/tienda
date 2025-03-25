import { NextResponse } from 'next/server';
import * as paypal from '@paypal/checkout-server-sdk';

// Configuración robusta del cliente PayPal
const getPaypalClient = () => {
  // Usa variables de entorno con valor por defecto para pruebas
  const clientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || process.env.PAYPAL_CLIENT_ID;
  const clientSecret = process.env.PAYPAL_SECRET;

  console.log('Credenciales PayPal:', {
    clientId: clientId ? clientId.substring(0, 5) + '...' : 'No definido',
    clientSecretExists: !!clientSecret
  });

  if (!clientId || !clientSecret) {
    console.error('Configuración de credenciales de PayPal incompleta');
    throw new Error('PayPal credentials not configured. Check PAYPAL_CLIENT_ID and PAYPAL_SECRET');
  }

  // Usa SandboxEnvironment para pruebas
  const environment = new paypal.core.SandboxEnvironment(
    clientId,
    clientSecret
  );

  return new paypal.core.PayPalHttpClient(environment);
};

export async function POST(req: Request) {
  try {
    // Parseo robusto del cuerpo de la solicitud
    let body;
    try {
      body = await req.json();
      console.log('Cuerpo de la solicitud:', JSON.stringify(body, null, 2));
    } catch (parseError) {
      console.error('Error al parsear JSON:', parseError);
      return NextResponse.json(
        { error: 'Formato de solicitud inválido' },
        { status: 400 }
      );
    }

    // Validación de monto
    const amount = body.amount;
    const currency = body.currency || 'MXN';

    if (!amount) {
      console.error('Monto no proporcionado');
      return NextResponse.json(
        { error: 'Monto es requerido' },
        { status: 400 }
      );
    }

    const amountNumber = parseFloat(amount);

    if (isNaN(amountNumber) || amountNumber <= 0) {
      console.error('Monto inválido:', amount);
      return NextResponse.json(
        { error: 'Monto inválido' },
        { status: 400 }
      );
    }

    // Crear cliente PayPal
    let client;
    try {
      client = getPaypalClient();
    } catch (clientError) {
      console.error('Error al crear cliente PayPal:', clientError);
      return NextResponse.json(
        { error: 'Error en configuración de PayPal', details: clientError.message },
        { status: 500 }
      );
    }

    // Preparar solicitud de orden
    const request = new paypal.orders.OrdersCreateRequest();
    
    console.log('Detalles de la solicitud de PayPal:', {
      currency_code: currency,
      value: amountNumber.toFixed(2)
    });

    try {
      request.prefer('return=representation');
      request.requestBody({
        intent: 'CAPTURE',
        purchase_units: [{
          amount: {
            currency_code: currency,
            value: amountNumber.toFixed(2)
          }
        }]
      });

      console.log('Solicitud de orden preparada, ejecutando...');
      
      // Ejecutar solicitud con manejo de errores detallado
      try {
        const orderResponse = await client.execute(request);
        
        console.log('Respuesta completa de PayPal:', JSON.stringify(orderResponse, null, 2));

        if (!orderResponse || !orderResponse.result) {
          console.error('Respuesta de PayPal sin resultado');
          throw new Error('No se pudo crear la orden de PayPal');
        }

        return NextResponse.json({
          orderID: orderResponse.result.id,
          status: orderResponse.result.status
        });
      } catch (executeError: any) {
        console.error('Error detallado al ejecutar la solicitud:', executeError);
        
        // Imprimir todas las propiedades del error
        console.error('Propiedades del error:', Object.keys(executeError));
        
        if (executeError.response) {
          console.error('Detalles de la respuesta:', JSON.stringify(executeError.response, null, 2));
        }

        return NextResponse.json(
          {
            error: 'Error al crear la orden de PayPal',
            details: executeError.message,
            fullErrorKeys: Object.keys(executeError),
            fullError: executeError.toString()
          },
          { status: 500 }
        );
      }
    } catch (bodyError: any) {
      console.error('Error al preparar el cuerpo de la solicitud:', bodyError);
      return NextResponse.json(
        {
          error: 'Error al preparar la solicitud de PayPal',
          details: bodyError.message
        },
        { status: 500 }
      );
    }
  } catch (error: any) {
    console.error('Error completo de la solicitud:', error);
    return NextResponse.json(
      {
        error: 'Error al procesar pago',
        details: error.message,
        fullError: error.toString()
      },
      { status: 500 }
    );
  }
}