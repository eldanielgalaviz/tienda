// src/hooks/use-mobile.ts
"use client";

import { useState, useEffect } from "react";

export function useMobile() {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Verificar tamaño inicial
    checkIfMobile();

    // Configurar listener para cambios de tamaño
    window.addEventListener("resize", checkIfMobile);

    // Limpiar listener
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  return { isMobile };
}