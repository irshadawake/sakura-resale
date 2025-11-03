import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import Header from '@/components/Header'
import Providers from '@/components/Providers'
import AuthHydration from '@/components/AuthHydration'
import { Toaster } from 'react-hot-toast'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Sakura Resale - Buy & Sell Anything',
  description: 'Your trusted marketplace for pre-loved goods in Japan',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <AuthHydration />
          <Header />
          <main className="min-h-screen">
            {children}
          </main>
          <footer className="bg-gray-900 text-white py-12 mt-20">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <span className="text-2xl">🌸</span>
                    <span className="text-xl font-bold">Sakura Resale</span>
                  </div>
                  <p className="text-gray-400 text-sm">
                    Your trusted marketplace for pre-loved goods. Buy and sell with confidence.
                  </p>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Quick Links</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/about">About Us</a></li>
                    <li><a href="/how-it-works">How It Works</a></li>
                    <li><a href="/safety">Safety Tips</a></li>
                    <li><a href="/contact">Contact</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Categories</h3>
                  <ul className="space-y-2 text-sm text-gray-400">
                    <li><a href="/category/electronics">Electronics</a></li>
                    <li><a href="/category/furniture">Furniture</a></li>
                    <li><a href="/category/clothing">Clothing</a></li>
                    <li><a href="/category/free-giveaways">Free Giveaways</a></li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold mb-4">Download App</h3>
                  <div className="space-y-3">
                    <a href="#" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
                      <span className="text-2xl">📱</span>
                      <div className="text-xs">
                        <div className="text-gray-400">Download on the</div>
                        <div className="font-semibold">App Store</div>
                      </div>
                    </a>
                    <a href="#" className="flex items-center space-x-2 bg-gray-800 px-4 py-2 rounded-lg hover:bg-gray-700">
                      <span className="text-2xl">🤖</span>
                      <div className="text-xs">
                        <div className="text-gray-400">Get it on</div>
                        <div className="font-semibold">Google Play</div>
                      </div>
                    </a>
                  </div>
                </div>
              </div>
              <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm text-gray-400">
                <p>&copy; 2025 Sakura Resale. All rights reserved.</p>
              </div>
            </div>
          </footer>
          <Toaster position="top-right" />
        </Providers>
      </body>
    </html>
  )
}
