// app/api/categories/route.ts
import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET() {
  try {
    const categories = await prisma.categories.findMany({
      where: {
        parent_id: null
      },
      include: {
        children: true // Incluir subcategorías
      }
    })

    return NextResponse.json(categories)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Error fetching categories' },
      { status: 500 }
    )
  }
}