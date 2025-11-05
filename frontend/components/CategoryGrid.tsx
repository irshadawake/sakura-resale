'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchCategories } from '@/lib/api'

const categoryIcons: Record<string, string> = {
  electronics: '📱',
  furniture: '🪑',
  clothing: '👕',
  books: '📚',
  sports: '⚽',
  'home-appliances': '🏠',
  'houses-apartments': '🏘️',
  'jobs-services': '💼',
  'bulk-sale': '📦',
  'free-giveaways': '🎁',
}

// Mock data for when backend is not available
const mockCategories = [
  { id: '1', name: 'Electronics', slug: 'electronics', items_count: 1234 },
  { id: '2', name: 'Furniture', slug: 'furniture', items_count: 856 },
  { id: '3', name: 'Clothing', slug: 'clothing', items_count: 2341 },
  { id: '4', name: 'Books', slug: 'books', items_count: 567 },
  { id: '5', name: 'Sports', slug: 'sports', items_count: 423 },
  { id: '6', name: 'Free Giveaways', slug: 'free-giveaways', items_count: 86 },
]

export default function CategoryGrid() {
  const { data: categories, isLoading, error } = useQuery({
    queryKey: ['categories'],
    queryFn: fetchCategories,
  })

  // Use mock data if API fails
  const displayCategories = categories || mockCategories

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
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
        {displayCategories?.map((category: any) => {
          const isFreeGiveaway = category.slug === 'free-giveaways'
          const isBulkSale = category.slug === 'bulk-sale'
          return (
            <Link
              key={category.id}
              href={`/category/${category.slug}`}
              className={`card p-8 text-center hover:scale-105 transition-transform ${
                isFreeGiveaway ? 'bg-green-50 border-2 border-green-400' : ''
              } ${
                isBulkSale ? 'bg-orange-50 border-2 border-orange-400' : ''
              }`}
            >
              <div className="text-5xl mb-4">
                {categoryIcons[category.slug] || '📦'}
              </div>
              <h3 className={`font-semibold text-lg ${
                isFreeGiveaway ? 'text-green-700' : isBulkSale ? 'text-orange-700' : 'text-gray-800'
              }`}>
                {category.name}
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                {category.items_count || 0} items
              </p>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
