export interface Product {
  id: string
  name: string
  price: number
  images: string[]
  category: string
  tags: string[]
  stock: number
  variants: ProductVariant[]
  description?: string
  specifications?: { name: string; value: string }[]
}

export interface ProductVariant {
  id: string
  name: string
  price: number
  stock: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  image: string
  quantity: number
  variant: string
  variantName?: string
}

export interface Order {
  id: string
  date: string
  status: "pending" | "processing" | "completed" | "cancelled"
  items: CartItem[]
  total: number
  customer: {
    name: string
    email: string
  }
  shipping: {
    address: string
    city: string
    state: string
    postalCode: string
    country: string
  }
  payment: {
    method: string
    transactionId?: string
  }
}

export interface User {
  id: string
  name: string
  email: string
  role: "customer" | "admin"
  orders?: Order[]
  wishlist?: string[]
  addresses?: {
    id: string
    name: string
    address: string
    city: string
    state: string
    postalCode: string
    country: string
    isDefault: boolean
  }[]
}

