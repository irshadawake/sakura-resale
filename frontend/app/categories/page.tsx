'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'

export default function AllCategoriesPage() {
  const [expandedCategories, setExpandedCategories] = useState<Set<string>>(new Set())

  // Fetch all parent categories
  const { data: parentCategories, isLoading } = useQuery({
    queryKey: ['categories', 'all-parents'],
    queryFn: async () => {
      const response = await axios.get('http://localhost:4000/api/v1/categories?parent_only=true')
      return response.data
    },
  })

  const toggleCategory = (slug: string) => {
    const newExpanded = new Set(expandedCategories)
    if (newExpanded.has(slug)) {
      newExpanded.delete(slug)
    } else {
      newExpanded.add(slug)
    }
    setExpandedCategories(newExpanded)
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading categories...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">All Categories</h1>
          <p className="text-gray-600 mt-2">Browse all available categories and subcategories</p>
        </div>

        {/* Categories Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {parentCategories?.map((category: any) => (
            <CategoryCard
              key={category.id}
              category={category}
              isExpanded={expandedCategories.has(category.slug)}
              onToggle={() => toggleCategory(category.slug)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

interface CategoryCardProps {
  category: any
  isExpanded: boolean
  onToggle: () => void
}

function CategoryCard({ category, isExpanded, onToggle }: CategoryCardProps) {
  const isFreeGiveaway = category.slug === 'free-giveaways'
  const isBulkSale = category.slug === 'bulk-sale'

  // Fetch subcategories when expanded
  const { data: subcategories } = useQuery({
    queryKey: ['subcategories', category.slug],
    queryFn: async () => {
      const response = await axios.get(
        `http://localhost:4000/api/v1/categories/${category.slug}/subcategories`
      )
      return response.data
    },
    enabled: isExpanded,
  })

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all ${
        isFreeGiveaway ? 'border-2 border-green-400' : ''
      } ${isBulkSale ? 'border-2 border-orange-400' : ''}`}
    >
      {/* Parent Category Header */}
      <div className="p-6">
        <div className="flex items-center justify-between">
          <Link
            href={`/category/${category.slug}`}
            className="flex items-center space-x-3 flex-1 hover:text-pink-600 transition-colors"
          >
            <span className="text-3xl">{category.icon || '📦'}</span>
            <div>
              <h3
                className={`text-lg font-semibold ${
                  isFreeGiveaway ? 'text-green-700' : isBulkSale ? 'text-orange-700' : 'text-gray-900'
                }`}
              >
                {category.name}
              </h3>
              <p className="text-sm text-gray-500">{category.items_count || 0} items</p>
            </div>
          </Link>

          {/* Expand button */}
          <button
            onClick={onToggle}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-5 h-5 text-gray-600 transition-transform ${
                isExpanded ? 'rotate-180' : ''
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 9l-7 7-7-7"
              />
            </svg>
          </button>
        </div>

        {/* Subcategories - shown when expanded */}
        {isExpanded && subcategories && subcategories.length > 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <div className="grid grid-cols-1 gap-2">
              {subcategories.map((sub: any) => (
                <Link
                  key={sub.id}
                  href={`/category/${sub.slug}`}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors group"
                >
                  <div className="flex items-center space-x-2">
                    <span className="text-sm">{sub.icon || '•'}</span>
                    <span className="text-sm text-gray-700 group-hover:text-pink-600">
                      {sub.name}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">{sub.items_count || 0}</span>
                </Link>
              ))}
            </div>
          </div>
        )}

        {isExpanded && subcategories && subcategories.length === 0 && (
          <div className="mt-4 pt-4 border-t border-gray-200">
            <p className="text-sm text-gray-500 italic">No subcategories</p>
          </div>
        )}
      </div>
    </div>
  )
}
