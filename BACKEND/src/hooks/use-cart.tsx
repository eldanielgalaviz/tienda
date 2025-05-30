import { create } from "zustand"
import { persist } from "zustand/middleware"
import type { CartItem } from "@/types"

interface CartStore {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, variant: string) => void
  updateQuantity: (id: string, variant: string, quantity: number) => void
  clearCart: () => void
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingItem = items.find((i) => i.id === item.id && i.variant === item.variant)

        if (existingItem) {
          return set({
            items: items.map((i) =>
              i.id === item.id && i.variant === item.variant ? { ...i, quantity: i.quantity + item.quantity } : i,
            ),
          })
        }

        set({ items: [...items, item] })
      },

      removeItem: (id, variant) => {
        const { items } = get()
        set({
          items: items.filter((item) => !(item.id === id && item.variant === variant)),
        })
      },

      updateQuantity: (id, variant, quantity) => {
        const { items } = get()
        set({
          items: items.map((item) => (item.id === id && item.variant === variant ? { ...item, quantity } : item)),
        })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage",
    },
  ),
)

