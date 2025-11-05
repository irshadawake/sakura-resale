'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { fetchListings } from '@/lib/api'

interface Listing {
  id: string
  title: string
  price: number
  is_free: boolean
  location: string
  category_name: string
  images: Array<{ id: string; image_url: string }> | null
  created_at: string
}

export default function CategoryPage() {
  const params = useParams()
  const slug = params.slug as string
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryName, setCategoryName] = useState('')

  useEffect(() => {
    fetchCategoryListings()
  }, [slug])

  const fetchCategoryListings = async () => {
    try {
      // Handle free-giveaways as a special filter, not a category
      if (slug === 'free-giveaways') {
        const data = await fetchListings({ is_free: 'true' })
        setListings(data.listings || [])
        setCategoryName('Free Giveaways')
      } else {
        // Fetch category info first to get the correct name
        const categoryResponse = await fetch(`http://localhost:4000/api/v1/categories/${slug}`)
        if (categoryResponse.ok) {
          const categoryData = await categoryResponse.json()
          setCategoryName(categoryData.name)
        }
        
        // Then fetch listings
        const data = await fetchListings({ category: slug })
        setListings(data.listings || [])
      }
    } catch (error) {
      console.error('Error fetching listings:', error)
    } finally {
      setLoading(false)
    }
  }

  const getImageUrl = (listing: Listing) => {
    if (listing.images && listing.images.length > 0) {
      return listing.images[0].image_url
    }
    return '/images/placeholder.jpg'
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listings...</p>
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
          <Link href="/categories" className="text-pink-600 hover:text-pink-700 text-sm mb-2 inline-block">
            ← Back to Categories
          </Link>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">
            {categoryName}
          </h1>
          <p className="text-gray-600">
            {listings.length} {listings.length === 1 ? 'item' : 'items'} available
          </p>
        </div>

        {/* Listings Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {listings.map((listing) => (
            <Link
              key={listing.id}
              href={`/listings/${listing.id}`}
              className="bg-white rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden group"
            >
              <div className="relative h-48 bg-gray-200">
                <img
                  src={getImageUrl(listing)}
                  alt={listing.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                />
                {listing.is_free && (
                  <div className="absolute top-2 left-2">
                    <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                      FREE
                    </span>
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-2 line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-lg font-bold text-pink-600 mb-2">
                  {listing.is_free ? 'Free' : `¥${listing.price.toLocaleString()}`}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500">
                  <span>📍 {listing.location}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Empty State */}
        {listings.length === 0 && (
          <div className="text-center py-20">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No items in this category yet
            </h3>
            <p className="text-gray-600 mb-6">
              Be the first to list something!
            </p>
            <Link
              href="/listings/new"
              className="inline-block px-6 py-3 bg-pink-600 text-white rounded-lg hover:bg-pink-700"
            >
              Create Listing
            </Link>
          </div>
        )}
      </div>
    </div>
  )
}
