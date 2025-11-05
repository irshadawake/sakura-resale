'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { fetchListingById } from '@/lib/api'

interface Listing {
  id: string
  title: string
  description: string
  price: number
  is_free: boolean
  condition: string
  location: string
  status: string
  category_name: string
  category_slug: string
  is_bulk_sale: boolean
  bulk_items_description: string | null
  images: Array<{ id: string; image_url: string; display_order: number }> | null
  user_id: string
  created_at: string
  updated_at: string
}

interface User {
  id: string
  username: string
  full_name: string
  avatar_url?: string
}

export default function ListingDetailPage() {
  const params = useParams()
  const router = useRouter()
  const id = params.id as string
  const [listing, setListing] = useState<Listing | null>(null)
  const [seller, setSeller] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedImage, setSelectedImage] = useState(0)

  useEffect(() => {
    fetchListing()
  }, [id])

  const fetchListing = async () => {
    try {
      const data = await fetchListingById(id)
      setListing(data)
      
      // Fetch seller info
      if (data.user_id) {
        fetchSeller(data.user_id)
      }
    } catch (error) {
      console.error('Error fetching listing:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSeller = async (userId: string) => {
    try {
      const response = await fetch(`http://localhost:4000/api/v1/users/${userId}`)
      if (response.ok) {
        const data = await response.json()
        setSeller(data)
      }
    } catch (error) {
      console.error('Error fetching seller:', error)
    }
  }

  const getImages = () => {
    if (!listing?.images || listing.images.length === 0) {
      return [{ id: 'placeholder', image_url: '/images/placeholder.jpg', display_order: 0 }]
    }
    return listing.images.sort((a, b) => a.display_order - b.display_order)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading listing...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!listing) {
    return (
      <div className="min-h-screen bg-gray-50 py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Listing not found</h2>
          <Link href="/" className="text-pink-600 hover:text-pink-700">
            ← Back to home
          </Link>
        </div>
      </div>
    )
  }

  const images = getImages()

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Back Button */}
        <button onClick={() => router.back()} className="text-pink-600 hover:text-pink-700 mb-6 inline-block">
          ← Back
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Image Gallery */}
          <div>
            <div className="bg-white rounded-lg overflow-hidden mb-4">
              <img
                src={images[selectedImage].image_url}
                alt={listing.title}
                className="w-full h-96 object-cover"
              />
            </div>
            {images.length > 1 && (
              <div className="grid grid-cols-4 gap-2">
                {images.map((img, index) => (
                  <button
                    key={img.id}
                    onClick={() => setSelectedImage(index)}
                    className={`border-2 rounded-lg overflow-hidden ${
                      selectedImage === index ? 'border-pink-600' : 'border-gray-200'
                    }`}
                  >
                    <img src={img.image_url} alt="" className="w-full h-20 object-cover" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Listing Details */}
          <div className="bg-white rounded-lg p-6">
            {/* Status Badge */}
            {listing.status !== 'active' && (
              <div className="mb-4">
                <span className="px-3 py-1 bg-gray-200 text-gray-700 text-sm font-medium rounded-full">
                  {listing.status.toUpperCase()}
                </span>
              </div>
            )}

            <h1 className="text-3xl font-bold text-gray-900 mb-4">{listing.title}</h1>

            <div className="mb-6">
              <p className="text-4xl font-bold text-pink-600">
                {listing.is_free ? 'Free' : `¥${listing.price.toLocaleString()}`}
              </p>
            </div>

            {/* Info Grid */}
            <div className="grid grid-cols-2 gap-4 mb-6 pb-6 border-b">
              <div>
                <p className="text-sm text-gray-600">Condition</p>
                <p className="font-semibold">{listing.condition}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Location</p>
                <p className="font-semibold">📍 {listing.location}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Category</p>
                <p className="font-semibold">{listing.category_name}</p>
              </div>
              <div>
                <p className="text-sm text-gray-600">Posted</p>
                <p className="font-semibold">{new Date(listing.created_at).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Description */}
            <div className="mb-6 pb-6 border-b">
              <h2 className="text-lg font-semibold mb-3">Description</h2>
              <p className="text-gray-700 whitespace-pre-wrap">{listing.description}</p>
            </div>

            {/* Bundle Items */}
            {listing.is_bulk_sale && listing.bulk_items_description && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <span className="mr-2">📦</span>
                  Bundle Items
                </h2>
                <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
                  <ul className="space-y-2">
                    {listing.bulk_items_description.split('\n').map((item, index) => (
                      <li key={index} className="text-gray-700 flex items-start">
                        <span className="mr-2">•</span>
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Seller Info */}
            {seller && (
              <div className="mb-6 pb-6 border-b">
                <h2 className="text-lg font-semibold mb-3">Seller</h2>
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-xl font-bold text-gray-600">
                    {seller.username?.[0]?.toUpperCase() || '?'}
                  </div>
                  <div className="ml-4">
                    <p className="font-semibold">{seller.full_name || seller.username}</p>
                    <p className="text-sm text-gray-600">@{seller.username}</p>
                  </div>
                </div>
              </div>
            )}

            {/* Contact Button */}
            {listing.status === 'active' && (
              <button className="w-full bg-pink-600 text-white py-3 rounded-lg font-semibold hover:bg-pink-700 transition-colors">
                Contact Seller
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
