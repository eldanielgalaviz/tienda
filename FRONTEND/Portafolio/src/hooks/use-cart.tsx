"use client";

import { useState } from "react";

export function useCart() {
  const [items, setItems] = useState<any[]>([]);

  const addItem = (item: any) => setItems((prev) => [...prev, item]);

  const removeItem = (id: string) =>
    setItems((prev) => prev.filter((item) => item.id !== id));

  const clearCart = () => setItems([]);

  return {
    items,
    addItem,
    removeItem,
    clearCart,
    totalItems: items.length,
  };
}
