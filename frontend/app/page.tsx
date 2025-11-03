'use client'

import Hero from '@/components/Hero'
import CategoryGrid from '@/components/CategoryGrid'
import FeaturedListings from '@/components/FeaturedListings'

export default function Home() {
  return (
    <>
      <Hero />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <CategoryGrid />
      </div>
      <div className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FeaturedListings />
        </div>
      </div>
    </>
  )
}
