// test.js - Versión para Next.js (no requiere dotenv)
console.log('MP_ACCESS_TOKEN:', process.env.MERCADO_PAGO_ACCESS_TOKEN?.substring(0, 10) + '...');
console.log('MP_PUBLIC_KEY:', process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY?.substring(0, 10) + '...');