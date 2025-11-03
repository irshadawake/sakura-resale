'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

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

export default function FreeGiveawaysPage() {
  const [listings, setListings] = useState<Listing[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchFreeListings()
  }, [])

  const fetchFreeListings = async () => {
    try {
      const response = await fetch('http://localhost:4000/api/v1/listings?is_free=true')
      if (!response.ok) throw new Error('Failed to fetch free listings')
      const data = await response.json()
      setListings(data.listings || [])
    } catch (error) {
      console.error('Error fetching free listings:', error)
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
            <p className="mt-4 text-gray-600">Loading free items...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-12">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-4xl font-bold text-gray-900 mb-2">
                🎁 Free Giveaways
              </h1>
              <p className="text-lg text-gray-600">
                Discover items being given away for free
              </p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-pink-600">{listings.length}</p>
              <p className="text-sm text-gray-600">items available</p>
            </div>
          </div>
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
                <div className="absolute top-2 right-2">
                  <button className="p-2 bg-white rounded-full shadow-md hover:bg-gray-50">
                    <span className="text-gray-600">♥</span>
                  </button>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="px-3 py-1 bg-green-500 text-white text-xs font-bold rounded-full">
                    FREE
                  </span>
                </div>
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-gray-900 mb-1 line-clamp-2">
                  {listing.title}
                </h3>
                <p className="text-sm text-gray-600 mb-2">{listing.category_name}</p>
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
            <div className="text-6xl mb-4">🎁</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No free items available right now
            </h3>
            <p className="text-gray-600">
              Check back later for new giveaways!
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
