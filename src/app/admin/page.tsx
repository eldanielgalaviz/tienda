"use client"

import Link from "next/link"

export default function AdminPage() {
  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Panel de Administración</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Link href="/admin/dashboard" className="p-4 border rounded-lg hover:bg-gray-50">
          Dashboard
        </Link>
        <Link href="/admin/products" className="p-4 border rounded-lg hover:bg-gray-50">
          Productos
        </Link>
        <Link href="/admin/orders" className="p-4 border rounded-lg hover:bg-gray-50">
          Órdenes
        </Link>
        <Link href="/admin/customers" className="p-4 border rounded-lg hover:bg-gray-50">
          Clientes
        </Link>
      </div>
    </div>
  )
}