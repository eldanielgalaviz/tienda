// app/categories/page.tsx
import { prisma } from '@/lib/prisma'

export default async function CategoriesPage() {
  const categories = await prisma.categories.findMany({
    where: { parent_id: null },
    include: {
      children: true
    }
  })

  return (
    <div className="container mx-auto py-8">
      <h1 className="text-2xl font-bold mb-6">Categorías</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {categories.map((category) => (
          <div key={category.id} className="border rounded-lg p-4">
            <h2 className="text-xl font-semibold">{category.name}</h2>
            <p className="text-gray-600">{category.description}</p>
            {category.children.length > 0 && (
              <div className="mt-4">
                <h3 className="font-medium">Subcategorías:</h3>
                <ul className="mt-2 space-y-1">
                  {category.children.map((subcat) => (
                    <li key={subcat.id} className="text-sm">
                      {subcat.name}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}