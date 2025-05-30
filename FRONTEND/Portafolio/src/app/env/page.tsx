export default function handler(req, res) {
    res.status(200).json({
      accessToken: process.env.MERCADO_PAGO_ACCESS_TOKEN,
      publicKey: process.env.NEXT_PUBLIC_MERCADO_PAGO_PUBLIC_KEY
    });
  }