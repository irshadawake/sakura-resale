'use client'

import Link from 'next/link'
import Image from 'next/image'

interface ListingCardProps {
  listing: any
}

export default function ListingCard({ listing }: ListingCardProps) {
  const imageUrl = listing.images?.[0]?.image_url || '/placeholder.png'
  const isFree = listing.is_free || listing.price === 0
  const categoryIcon = getCategoryIcon(listing.category_slug)

  return (
    <Link href={`/listings/${listing.id}`} className="card overflow-hidden group">
      <div className="relative h-48 bg-gray-200">
        <div className="text-6xl flex items-center justify-center h-full">
          {categoryIcon}
        </div>
        {listing.condition && (
          <div className="absolute top-2 left-2 bg-white px-2 py-1 rounded text-xs font-semibold text-gray-700">
            {listing.condition}
          </div>
        )}
        {isFree && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-xs font-semibold">
            FREE
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-lg mb-2 text-gray-800 group-hover:text-sakura-pink transition-colors line-clamp-2">
          {listing.title}
        </h3>

        <div className="flex items-center justify-between mb-2">
          {isFree ? (
            <span className="text-2xl font-bold text-green-600">FREE</span>
          ) : (
            <span className="text-2xl font-bold text-sakura-pink">
              ¥{Number(listing.price).toLocaleString()}
            </span>
          )}
          {listing.condition && (
            <span className="text-sm text-gray-500">{listing.condition}</span>
          )}
        </div>

        <div className="flex items-center text-sm text-gray-500 space-x-2">
          <span>📍</span>
          <span>{listing.location || listing.prefecture}</span>
        </div>

        <div className="mt-2 text-xs text-gray-400">
          {listing.category_name}
        </div>
      </div>
    </Link>
  )
}

function getCategoryIcon(slug: string): string {
  const icons: Record<string, string> = {
    electronics: '📱',
    furniture: '🛋️',
    clothing: '👕',
    books: '📚',
    sports: '🚴',
    'free-giveaways': '🎁',
  }
  return icons[slug] || '📦'
}
