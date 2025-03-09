import { create } from "zustand"
import { persist } from "zustand/middleware"

export type CartItem = {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  variant: string
  variantName?: string
}

type CartStore = {
  items: CartItem[]
  addItem: (item: CartItem) => void
  removeItem: (id: string, variant: string) => void
  updateQuantity: (id: string, variant: string, quantity: number) => void
  clearCart: () => void
  getItemsCount: () => number
  getTotal: () => number
}

export const useCart = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const { items } = get()
        const existingItemIndex = items.findIndex((i) => i.id === item.id && i.variant === item.variant)

        if (existingItemIndex !== -1) {
          // Si el producto ya existe, actualiza la cantidad
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += item.quantity
          set({ items: updatedItems })
        } else {
          // Si el producto no existe, añádelo al carrito
          set({ items: [...items, item] })
        }
      },

      removeItem: (id, variant) => {
        const { items } = get()
        set({
          items: items.filter((item) => !(item.id === id && item.variant === variant)),
        })
      },

      updateQuantity: (id, variant, quantity) => {
        const { items } = get()
        const updatedItems = items.map((item) => {
          if (item.id === id && item.variant === variant) {
            return { ...item, quantity }
          }
          return item
        })

        set({ items: updatedItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getItemsCount: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      getTotal: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.price * item.quantity, 0)
      },
    }),
    {
      name: "cart-storage", // Nombre para localStorage
      skipHydration: false, // No omitir la hidratación inicial
    },
  ),
)

