// src/components/PayPalProvider.tsx
"use client"

import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export function PayPalProvider({ children }: { children: React.ReactNode }) {
  return (
    <PayPalScriptProvider
      options={{
        clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID || "",
        currency: "MXN",
        intent: "capture"
      }}
    >
      {children}
    </PayPalScriptProvider>
  );
}