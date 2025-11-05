'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { createListing, fetchCategories } from '@/lib/api'
import toast from 'react-hot-toast'

export default function CreateListingPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category_id: '',
    price: '',
    is_free: false,
    condition: 'Good',
    location: '',
    city: '',
    prefecture: '',
    is_bulk_sale: false,
    bulk_items_description: '',
    price_per_item: false,
  })

  const selectedCategory = categories.find(c => c.id === formData.category_id)
  const isBundleSaleCategory = selectedCategory?.slug === 'bulk-sale'

  useEffect(() => {
    if (!user) {
      toast.error('Please login to create a listing')
      router.push('/login')
      return
    }

    loadCategories()
  }, [user, router])

  const loadCategories = async () => {
    try {
      const data = await fetchCategories()
      setCategories(data)
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.category_id) {
      toast.error('Please select a category')
      return
    }

    if (!formData.is_free && !formData.price) {
      toast.error('Please enter a price or mark as free')
      return
    }

    setLoading(true)

    try {
      const submitData = new FormData()
      submitData.append('title', formData.title)
      submitData.append('description', formData.description)
      submitData.append('category_id', formData.category_id)
      submitData.append('condition', formData.condition)
      submitData.append('location', formData.location)
      submitData.append('prefecture', formData.prefecture)
      
      if (formData.city) {
        submitData.append('city', formData.city)
      }

      if (formData.is_free) {
        submitData.append('is_free', 'true')
        submitData.append('price', '0')
      } else {
        submitData.append('is_free', 'false')
        submitData.append('price', formData.price)
      }

      // Add bundle sale fields if applicable
      if (isBundleSaleCategory) {
        submitData.append('is_bulk_sale', 'true')
        submitData.append('bulk_items_description', formData.bulk_items_description)
        submitData.append('price_per_item', formData.price_per_item ? 'true' : 'false')
      }

      await createListing(submitData)
      toast.success('Listing created successfully!')
      router.push('/my-listings')
    } catch (error: any) {
      const errorMsg = error.response?.data?.error || 'Failed to create listing'
      toast.error(errorMsg)
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value, type } = e.target
    const checked = (e.target as HTMLInputElement).checked

    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    })
  }

  const japanPrefectures = [
    'Tokyo', 'Osaka', 'Kyoto', 'Hokkaido', 'Fukuoka', 'Kanagawa', 'Saitama', 
    'Chiba', 'Hyogo', 'Aichi', 'Hiroshima', 'Miyagi', 'Okinawa', 'Others'
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Post a New Item</h1>
          <p className="text-gray-600 mt-2">
            Fill in the details below to list your item
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
              Title <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="title"
              name="title"
              required
              minLength={5}
              maxLength={255}
              value={formData.title}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., iPhone 13 Pro - Excellent Condition"
            />
            <p className="text-xs text-gray-500 mt-1">At least 5 characters</p>
          </div>

          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
              Description <span className="text-red-500">*</span>
            </label>
            <textarea
              id="description"
              name="description"
              required
              minLength={20}
              rows={5}
              value={formData.description}
              onChange={handleChange}
              className="input-field"
              placeholder="Describe your item in detail..."
            />
            <p className="text-xs text-gray-500 mt-1">At least 20 characters</p>
          </div>

          {/* Category */}
          <div>
            <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
              Category <span className="text-red-500">*</span>
            </label>
            <select
              id="category_id"
              name="category_id"
              required
              value={formData.category_id}
              onChange={handleChange}
              className="input-field"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.icon} {category.name}
                </option>
              ))}
            </select>
          </div>

          {/* Bundle Sale Fields */}
          {isBundleSaleCategory && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-4">
              <div className="flex items-center space-x-2 mb-4">
                <span className="text-2xl">📦</span>
                <h3 className="text-lg font-semibold text-orange-900">Bundle Sale Details</h3>
              </div>
              
              <div>
                <label htmlFor="bulk_items_description" className="block text-sm font-medium text-gray-700 mb-2">
                  List of Items in Bundle <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="bulk_items_description"
                  name="bulk_items_description"
                  required={isBundleSaleCategory}
                  rows={6}
                  value={formData.bulk_items_description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder="List all items included in this bundle:
e.g.,
- Queen bed with mattress
- 2-seater sofa (gray)
- Dining table with 4 chairs
- TV stand
- Microwave oven
- Rice cooker
- Vacuum cleaner"
                />
                <p className="text-xs text-gray-600 mt-1">
                  List each item clearly. Buyers want to know exactly what they're getting!
                </p>
              </div>

              <div>
                <label className="flex items-start space-x-3 cursor-pointer">
                  <input
                    type="checkbox"
                    name="price_per_item"
                    checked={formData.price_per_item}
                    onChange={handleChange}
                    className="w-5 h-5 text-orange-600 focus:ring-orange-500 border-gray-300 rounded mt-1"
                  />
                  <div>
                    <span className="text-sm font-medium text-gray-700">
                      Price is per item (not total)
                    </span>
                    <p className="text-xs text-gray-600 mt-1">
                      Check this if the price shown is for each individual item.
                      Example: ¥2,000 per item × 10 items = ¥20,000 total
                    </p>
                  </div>
                </label>
              </div>

              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>💡 Bundle Sale Tips:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Be specific about item conditions</li>
                  <li>Include measurements for furniture</li>
                  <li>Mention if items must be sold together</li>
                  <li>Take photos of all items if possible</li>
                </ul>
              </div>
            </div>
          )}

          {/* Price / Free */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="price" className="block text-sm font-medium text-gray-700 mb-2">
                Price (¥)
              </label>
              <input
                type="number"
                id="price"
                name="price"
                min="0"
                disabled={formData.is_free}
                value={formData.is_free ? '' : formData.price}
                onChange={handleChange}
                className="input-field disabled:bg-gray-100"
                placeholder="0"
              />
            </div>

            <div className="flex items-end">
              <label className="flex items-center space-x-2 cursor-pointer pb-3">
                <input
                  type="checkbox"
                  name="is_free"
                  checked={formData.is_free}
                  onChange={handleChange}
                  className="w-4 h-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium text-gray-700">
                  This item is FREE (giveaway)
                </span>
              </label>
            </div>
          </div>

          {/* Condition */}
          <div>
            <label htmlFor="condition" className="block text-sm font-medium text-gray-700 mb-2">
              Condition <span className="text-red-500">*</span>
            </label>
            <select
              id="condition"
              name="condition"
              required
              value={formData.condition}
              onChange={handleChange}
              className="input-field"
            >
              <option value="Like New">Like New</option>
              <option value="Good">Good</option>
              <option value="Fair">Fair</option>
              <option value="Poor">Poor</option>
            </select>
          </div>

          {/* Location */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label htmlFor="prefecture" className="block text-sm font-medium text-gray-700 mb-2">
                Prefecture <span className="text-red-500">*</span>
              </label>
              <select
                id="prefecture"
                name="prefecture"
                required
                value={formData.prefecture}
                onChange={handleChange}
                className="input-field"
              >
                <option value="">Select prefecture</option>
                {japanPrefectures.map((pref) => (
                  <option key={pref} value={pref}>
                    {pref}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="city" className="block text-sm font-medium text-gray-700 mb-2">
                City
              </label>
              <input
                type="text"
                id="city"
                name="city"
                value={formData.city}
                onChange={handleChange}
                className="input-field"
                placeholder="e.g., Shibuya"
              />
            </div>
          </div>

          {/* Full Location */}
          <div>
            <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-2">
              Detailed Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="location"
              name="location"
              required
              value={formData.location}
              onChange={handleChange}
              className="input-field"
              placeholder="e.g., Shibuya, Tokyo"
            />
          </div>

          {/* Image Upload (Coming Soon) */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
            <div className="text-4xl mb-2">📷</div>
            <p className="text-sm text-gray-600">Image upload coming soon</p>
            <p className="text-xs text-gray-500 mt-1">You can add images after creating the listing</p>
          </div>

          {/* Actions */}
          <div className="flex space-x-4">
            <button
              type="button"
              onClick={() => router.back()}
              className="flex-1 btn-secondary py-3"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 btn-primary py-3 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Post Listing'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
