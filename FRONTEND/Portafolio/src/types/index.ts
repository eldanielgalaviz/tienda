export interface Product {
  id: string
  name: string
  description?: string
  price: number
  images?: string[]
  discount?: number
  isNew?: boolean
  category?: string
  brand?: string
  variants?: ProductVariant[]
  stock?: number
  sku?: string
}

export interface ProductVariant {
  id: string
  name: string
  price?: number
  sku?: string
  stock?: number
}

export interface CartItem {
  id: string
  name: string
  price: number
  image?: string
  quantity: number
  variant: string
  variantName?: string
}

export interface User {
  id: string
  name: string
  email: string
  image?: string
}

export interface Order {
  id: string
  userId: string
  items: CartItem[]
  total: number
  status: "pending" | "processing" | "completed" | "cancelled"
  createdAt: Date
  shippingAddress: Address
  paymentMethod: string
}

export interface Address {
  name: string
  street: string
  city: string
  state: string
  postalCode: string
  country: string
  phone: string
}

