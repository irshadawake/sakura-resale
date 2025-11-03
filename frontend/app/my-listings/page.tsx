'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { fetchUserListings, deleteListing } from '@/lib/api'
import toast from 'react-hot-toast'

export default function MyListingsPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [deleting, setDeleting] = useState<string | null>(null)

  useEffect(() => {
    if (!user) {
      router.push('/login')
      return
    }

    loadListings()
  }, [user, router])

  const loadListings = async () => {
    try {
      setLoading(true)
      const data = await fetchUserListings(user!.id)
      console.log('Fetched listings:', data)
      // Handle both array response and object with listings property
      const listingsArray = Array.isArray(data) ? data : (data.listings || [])
      setListings(listingsArray)
    } catch (error: any) {
      console.error('Error loading listings:', error)
      const errorMsg = error.response?.data?.error || error.message || 'Failed to load listings'
      toast.error(errorMsg)
      setListings([]) // Set empty array on error
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this listing?')) {
      return
    }

    try {
      setDeleting(id)
      await deleteListing(id)
      setListings(listings.filter((l) => l.id !== id))
      toast.success('Listing deleted successfully')
    } catch (error) {
      toast.error('Failed to delete listing')
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadge = (status: string) => {
    const colors = {
      active: 'bg-green-100 text-green-800',
      sold: 'bg-gray-100 text-gray-800',
      inactive: 'bg-yellow-100 text-yellow-800',
    }
    return colors[status as keyof typeof colors] || colors.active
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-sakura-pink"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">My Listings</h1>
            <p className="text-gray-600 mt-2">
              Manage your posted items
            </p>
          </div>
          <Link href="/listings/create" className="btn-primary">
            + Post New Item
          </Link>
        </div>

        {listings.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📦</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No listings yet
            </h3>
            <p className="text-gray-600 mb-6">
              Start selling by posting your first item!
            </p>
            <Link href="/listings/create" className="btn-primary">
              Create Your First Listing
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {listings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
              >
                <div className="flex items-start justify-between">
                  <div className="flex space-x-4 flex-1">
                    <div className="w-24 h-24 bg-gray-200 rounded-lg flex items-center justify-center text-4xl">
                      {listing.images?.[0] ? (
                        <img
                          src={listing.images[0].image_url}
                          alt={listing.title}
                          className="w-full h-full object-cover rounded-lg"
                        />
                      ) : (
                        '📦'
                      )}
                    </div>

                    <div className="flex-1">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="text-xl font-semibold text-gray-900 mb-1">
                            {listing.title}
                          </h3>
                          <p className="text-gray-600 text-sm mb-2 line-clamp-2">
                            {listing.description}
                          </p>
                        </div>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${getStatusBadge(
                            listing.status
                          )}`}
                        >
                          {listing.status.toUpperCase()}
                        </span>
                      </div>

                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span className="font-semibold text-sakura-pink text-lg">
                          {listing.is_free ? (
                            <span className="text-green-600">FREE</span>
                          ) : (
                            `¥${Number(listing.price).toLocaleString()}`
                          )}
                        </span>
                        <span>•</span>
                        <span>{listing.category_name}</span>
                        <span>•</span>
                        <span>{listing.condition}</span>
                        <span>•</span>
                        <span>📍 {listing.location}</span>
                        <span>•</span>
                        <span>👁️ {listing.views_count || 0} views</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex space-x-2 ml-4">
                    <Link
                      href={`/listings/${listing.id}`}
                      className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      View
                    </Link>
                    <Link
                      href={`/listings/${listing.id}/edit`}
                      className="px-4 py-2 text-sm bg-sakura-pink text-white rounded-lg hover:bg-sakura-dark"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={() => handleDelete(listing.id)}
                      disabled={deleting === listing.id}
                      className="px-4 py-2 text-sm bg-red-500 text-white rounded-lg hover:bg-red-600 disabled:opacity-50"
                    >
                      {deleting === listing.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
