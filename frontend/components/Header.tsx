'use client'

import Link from 'next/link'
import { useAuthStore } from '@/store/authStore'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function Header() {
  const router = useRouter()
  const { user, logout, isHydrated } = useAuthStore()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  // Don't show user-specific UI until hydrated
  const showUser = isHydrated && user

  const handleLogout = () => {
    logout()
    router.push('/')
    setUserMenuOpen(false)
  }

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
            <Link href="/category/free-giveaways" className="text-gray-700 hover:text-sakura-pink transition-colors">
              Free Giveaways
            </Link>
            {showUser && (
              <Link href="/my-listings" className="text-gray-700 hover:text-sakura-pink transition-colors">
                My Listings
              </Link>
            )}
          </nav>

          {/* Right Side Actions */}
          <div className="hidden md:flex items-center space-x-4">
            {showUser ? (
              <>
                <Link href="/listings/create" className="btn-primary">
                  + Post Ad
                </Link>
                <div className="relative">
                  <button
                    onClick={() => setUserMenuOpen(!userMenuOpen)}
                    className="flex items-center space-x-2 text-gray-700 hover:text-sakura-pink"
                  >
                    <div className="w-8 h-8 bg-sakura-pink text-white rounded-full flex items-center justify-center font-semibold">
                      {user?.username?.charAt(0).toUpperCase()}
                    </div>
                    <span>{user?.username}</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  {userMenuOpen && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <Link
                        href="/profile"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Profile
                      </Link>
                      <Link
                        href="/my-listings"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        My Listings
                      </Link>
                      <Link
                        href="/favorites"
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                        onClick={() => setUserMenuOpen(false)}
                      >
                        Favorites
                      </Link>
                      <hr className="my-1" />
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <>
                <Link href="/login" className="text-gray-700 hover:text-sakura-pink">
                  Login
                </Link>
                <Link href="/register" className="btn-secondary">
                  Sign Up
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
              <Link href="/category/free-giveaways" className="text-gray-700">Free Giveaways</Link>
              {showUser ? (
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
