// Servicio para conectar con el backend NestJS

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api"

export async function fetchProducts(params = {}) {
  const queryParams = new URLSearchParams(params)
  const response = await fetch(`${API_URL}/products?${queryParams}`)

  if (!response.ok) {
    throw new Error("Error fetching products")
  }

  return response.json()
}

export async function fetchProduct(id: string) {
  const response = await fetch(`${API_URL}/products/${id}`)

  if (!response.ok) {
    throw new Error("Error fetching product")
  }

  return response.json()
}

export async function createOrder(orderData: any) {
  const response = await fetch(`${API_URL}/orders`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(orderData),
  })

  if (!response.ok) {
    throw new Error("Error creating order")
  }

  return response.json()
}

export async function fetchOrders(params = {}) {
  const queryParams = new URLSearchParams(params)
  const response = await fetch(`${API_URL}/orders?${queryParams}`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Error fetching orders")
  }

  return response.json()
}

export async function login(email: string, password: string) {
  const response = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ email, password }),
  })

  if (!response.ok) {
    throw new Error("Invalid credentials")
  }

  const data = await response.json()
  localStorage.setItem("token", data.token)

  return data
}

export async function register(userData: any) {
  const response = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error("Error registering user")
  }

  return response.json()
}

export async function fetchUserProfile() {
  const response = await fetch(`${API_URL}/users/profile`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Error fetching user profile")
  }

  return response.json()
}

export async function updateUserProfile(userData: any) {
  const response = await fetch(`${API_URL}/users/profile`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
    body: JSON.stringify(userData),
  })

  if (!response.ok) {
    throw new Error("Error updating user profile")
  }

  return response.json()
}

export async function fetchDashboardStats() {
  const response = await fetch(`${API_URL}/admin/stats`, {
    headers: {
      Authorization: `Bearer ${localStorage.getItem("token")}`,
    },
  })

  if (!response.ok) {
    throw new Error("Error fetching dashboard stats")
  }

  return response.json()
}

