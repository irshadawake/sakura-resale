'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useState } from 'react'

export default function Header() {
  const { user, logout } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <span className="text-2xl">🌸</span>
            <span className="text-xl font-bold text-sakura-pink">Sakura Resale</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link href="/" className="text-gray-700 hover:text-sakura-pink transition-colors">
              Home
            </Link>
            <Link href="/categories" className="text-gray-700 hover:text-sakura-pink transition-colors">
              Categories
            </Link>
            <Link href="/free-giveaways" className="text-gray-700 hover:text-sakura-pink transition-colors">
              Free Giveaways
            </Link>
            {user && (
              <Link href="/my-listings" className="text-gray-700 hover:text-sakura-pink transition-colors">
                My Listings
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link href="/listings/create" className="btn-primary">
                  + Post Ad
                </Link>
                <button
                  onClick={logout}
                  className="text-gray-700 hover:text-sakura-pink"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-sakura-pink">
                  Login
                </Link>
                <Link href="/listings/create" className="btn-primary">
                  + Post Ad
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t">
            <nav className="flex flex-col space-y-4">
              <Link href="/" className="text-gray-700">Home</Link>
              <Link href="/categories" className="text-gray-700">Categories</Link>
              <Link href="/free-giveaways" className="text-gray-700">Free Giveaways</Link>
              {user ? (
                <>
                  <Link href="/my-listings" className="text-gray-700">My Listings</Link>
                  <button onClick={logout} className="text-left text-gray-700">Logout</button>
                </>
              ) : (
                <Link href="/login" className="text-gray-700">Login</Link>
              )}
              <Link href="/listings/create" className="btn-primary text-center">+ Post Ad</Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  )
}
