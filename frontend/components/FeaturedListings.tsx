'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { fetchFeaturedListings } from '@/lib/api'
import ListingCard from './ListingCard'

// Mock data for when backend is not available
const mockListings = [
  {
    id: '1',
    title: 'iPhone 13 Pro - Excellent Condition',
    price: 800,
    condition: 'Like New',
    location: 'New York, NY',
    category_name: 'Electronics',
    category_slug: 'electronics',
    is_free: false,
    images: [],
  },
  {
    id: '2',
    title: 'Vintage Leather Sofa',
    price: 450,
    condition: 'Good',
    location: 'Los Angeles, CA',
    category_name: 'Furniture',
    category_slug: 'furniture',
    is_free: false,
    images: [],
  },
  {
    id: '3',
    title: 'Free Books Collection',
    price: 0,
    condition: 'Good',
    location: 'Chicago, IL',
    category_name: 'Books',
    category_slug: 'books',
    is_free: true,
    images: [],
  },
  {
    id: '4',
    title: 'Mountain Bike - Trek',
    price: 320,
    condition: 'Good',
    location: 'Denver, CO',
    category_name: 'Sports',
    category_slug: 'sports',
    is_free: false,
    images: [],
  },
]

export default function FeaturedListings() {
  const { data: listings, isLoading, error } = useQuery({
    queryKey: ['featured-listings'],
    queryFn: fetchFeaturedListings,
  })

  // Use mock data if API fails
  const displayListings = listings || mockListings

  if (isLoading) {
    return (
      <div className="text-center py-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sakura-pink mx-auto"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-bold text-gray-800">Featured Listings</h2>
        <Link
          href="/listings"
          className="text-sakura-pink hover:text-sakura-dark font-semibold flex items-center space-x-2"
        >
          <span>View All</span>
          <span>→</span>
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayListings?.slice(0, 8).map((listing: any) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>

      {(!displayListings || displayListings.length === 0) && (
        <div className="text-center py-12 text-gray-500">
          <p>No featured listings available at the moment.</p>
        </div>
      )}
    </div>
  )
}
