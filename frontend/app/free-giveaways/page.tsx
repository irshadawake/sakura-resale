'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function FreeGiveawaysRedirect() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/category/free-giveaways')
  }, [router])

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Redirecting...</p>
        </div>
      </div>
    </div>
  )
}
