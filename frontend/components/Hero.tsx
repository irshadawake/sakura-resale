'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'

export default function Hero() {
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState('')
  const [category, setCategory] = useState('all')

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    const params = new URLSearchParams()
    if (searchTerm) params.set('search', searchTerm)
    if (category !== 'all') params.set('category', category)
    router.push(`/listings?${params.toString()}`)
  }

  return (
    <div className="bg-gradient-to-r from-sakura-pink to-sakura-light text-white py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Buy & Sell Anything
          </h1>
          <p className="text-xl md:text-2xl mb-10 text-white/90">
            Your trusted marketplace for pre-loved goods
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} className="max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-xl p-2 flex flex-col md:flex-row gap-2">
              <input
                type="text"
                placeholder="What are you looking for?"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="flex-1 px-4 py-3 text-gray-800 rounded-md focus:outline-none"
              />
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="px-4 py-3 text-gray-800 rounded-md focus:outline-none bg-white border border-gray-200"
              >
                <option value="all">All Categories</option>
                <option value="electronics">Electronics</option>
                <option value="furniture">Furniture</option>
                <option value="clothing">Clothing</option>
                <option value="books">Books</option>
                <option value="sports">Sports</option>
                <option value="free-giveaways">Free Giveaways</option>
              </select>
              <button
                type="submit"
                className="bg-sakura-dark hover:bg-sakura-pink text-white font-semibold px-8 py-3 rounded-md transition-colors"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}
