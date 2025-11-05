'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function CategoryGrid() {
  const MAX_VISIBLE = 12
  
  // Fetch only parent categories
  const { data: categories, isLoading } = useQuery({
    queryKey: ['categories', 'parent'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/v1/categories?parent_only=true')
      return response.data
    },
  })

  // Show only first 12 categories
  const displayCategories = categories?.slice(0, MAX_VISIBLE) || []

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sakura-pink mx-auto"></div>
      </div>
    )
  }

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-12 text-gray-800">
        Browse Categories
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {displayCategories.map((category: any) => {
          const isFreeGiveaway = category.slug === 'free-giveaways'
          const isBulkSale = category.slug === 'bulk-sale'
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`card p-6 text-center hover:scale-105 transition-transform ${
                isFreeGiveaway ? 'bg-green-50 border-2 border-green-400' : ''
              } ${
                isBulkSale ? 'bg-orange-50 border-2 border-orange-400' : ''
              }`}
            >
              <div className="text-4xl mb-3">
                {category.icon || '📦'}
              </div>
              <h3 className={`font-semibold text-base ${
                isFreeGiveaway ? 'text-green-700' : isBulkSale ? 'text-orange-700' : 'text-gray-800'
              }`}>
                {category.name}
              </h3>
              <p className="text-xs text-gray-500 mt-2">
                {category.items_count || 0} items
              </p>
            </Link>
          )
        })}
      </div>
      
      {/* View More Button */}
      <div className="text-center mt-8">
        <Link
          href="/categories"
          className="inline-block px-8 py-3 bg-sakura-pink text-white rounded-lg font-semibold hover:bg-sakura-dark transition-colors"
        >
          View All Categories
        </Link>
      </div>
    </div>
  )
}
