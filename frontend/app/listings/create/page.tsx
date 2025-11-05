'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuthStore } from '@/store/authStore'
import { createListing } from '@/lib/api'
import toast from 'react-hot-toast'
import axios from 'axios'

export default function CreateListingPage() {
  const router = useRouter()
  const user = useAuthStore((state) => state.user)
  const [loading, setLoading] = useState(false)
  const [parentCategories, setParentCategories] = useState<any[]>([])
  const [subcategories, setSubcategories] = useState<any[]>([])
  const [selectedParentId, setSelectedParentId] = useState('')
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

  const [bundleItems, setBundleItems] = useState<Array<{
    name: string
    condition: string
    description: string
    price: string
    can_sell_separately: boolean
  }>>([])

  const MAX_BUNDLE_ITEMS = 10

  // Calculate total price from individual items
  const calculateTotalPrice = () => {
    const total = bundleItems.reduce((sum, item) => {
      const itemPrice = parseFloat(item.price) || 0
      return sum + itemPrice
    }, 0)
    return total
  }

  // Find the actual selected category from either parent or subcategories
  // When parent has no subcategories, use the selected parent
  const currentCategoryId = formData.category_id || (subcategories.length === 0 ? selectedParentId : '')
  const selectedCategory = [...parentCategories, ...subcategories].find(c => c.id === currentCategoryId)
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
      // Fetch only parent categories
      const response = await axios.get('http://localhost:4000/api/v1/categories?parent_only=true')
      // Filter out free-giveaways
      const filtered = response.data.filter((cat: any) => cat.slug !== 'free-giveaways')
      setParentCategories(filtered)
    } catch (error) {
      toast.error('Failed to load categories')
    }
  }

  const loadSubcategories = async (parentSlug: string) => {
    try {
      const response = await axios.get(`http://localhost:4000/api/v1/categories/${parentSlug}/subcategories`)
      setSubcategories(response.data)
    } catch (error) {
      console.error('Failed to load subcategories:', error)
      setSubcategories([])
    }
  }

  const handleParentChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const parentId = e.target.value
    setSelectedParentId(parentId)
    
    if (parentId) {
      const parent = parentCategories.find(c => c.id === parentId)
      if (parent) {
        loadSubcategories(parent.slug)
      }
    } else {
      setSubcategories([])
    }
    
    // Reset category selection when parent changes
    setFormData({ ...formData, category_id: '' })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Use parent category if no subcategories exist
    const finalCategoryId = formData.category_id || (subcategories.length === 0 ? selectedParentId : '')
    
    if (!finalCategoryId) {
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
      submitData.append('category_id', finalCategoryId)
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
        if (bundleItems.length === 0) {
          toast.error('Please add at least one item to the bundle')
          setLoading(false)
          return
        }
        
        // Convert bundle items array to formatted description
        const itemsDescription = bundleItems.map((item, index) => 
          `${index + 1}. ${item.name} - ${item.condition}${item.description ? ` (${item.description})` : ''}`
        ).join('\n')
        
        submitData.append('is_bulk_sale', 'true')
        submitData.append('bulk_items_description', itemsDescription)
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

  const addBundleItem = () => {
    if (bundleItems.length >= MAX_BUNDLE_ITEMS) {
      toast.error(`Maximum ${MAX_BUNDLE_ITEMS} items allowed per bundle`)
      return
    }
    setBundleItems([...bundleItems, { 
      name: '', 
      condition: 'Good', 
      description: '', 
      price: '',
      can_sell_separately: false 
    }])
  }

  const removeBundleItem = (index: number) => {
    setBundleItems(bundleItems.filter((_, i) => i !== index))
  }

  const updateBundleItem = (index: number, field: string, value: string | boolean) => {
    const updated = [...bundleItems]
    updated[index] = { ...updated[index], [field]: value }
    setBundleItems(updated)
    
    // Auto-update total price when item prices change
    if (field === 'price' && isBundleSaleCategory) {
      const total = calculateTotalPrice()
      setFormData({ ...formData, price: total.toString() })
    }
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
          {/* Category - Two-step selection */}
          <div className="bg-gray-50 p-6 rounded-lg border-2 border-gray-200 space-y-4">
            <label className="block text-lg font-semibold text-gray-900">
              Step 1: Select Category <span className="text-red-500">*</span>
            </label>
            
            {/* Parent Category */}
            <div>
              <label htmlFor="parent_category" className="block text-sm font-medium text-gray-700 mb-2">
                Main Category <span className="text-red-500">*</span>
              </label>
              <select
                id="parent_category"
                value={selectedParentId}
                onChange={handleParentChange}
                className="input-field"
              >
                <option value="">Select main category</option>
                {parentCategories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Subcategory - shown when parent is selected */}
            {selectedParentId && (
              <div>
                <label htmlFor="category_id" className="block text-sm font-medium text-gray-700 mb-2">
                  Subcategory <span className="text-red-500">*</span>
                </label>
                {subcategories.length > 0 ? (
                  <select
                    id="category_id"
                    name="category_id"
                    required
                    value={formData.category_id}
                    onChange={handleChange}
                    className="input-field"
                  >
                    <option value="">Select subcategory</option>
                    {subcategories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.icon || '•'} {category.name}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <p className="text-sm text-blue-800">
                      This category has no subcategories. You can post directly under this category.
                    </p>
                    <input type="hidden" name="category_id" value={selectedParentId} />
                  </div>
                )}
              </div>
            )}

            {isBundleSaleCategory && (
              <p className="mt-3 text-sm text-orange-700 bg-orange-50 p-3 rounded">
                📦 <strong>Bundle Sale:</strong> You can add up to {MAX_BUNDLE_ITEMS} items in this listing
              </p>
            )}
          </div>

          {/* General Title & Description */}
          {(formData.category_id || (selectedParentId && subcategories.length === 0)) && (
            <>
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-2">
                  {isBundleSaleCategory ? 'Bundle Title' : 'Title'} <span className="text-red-500">*</span>
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
                  placeholder={isBundleSaleCategory ? "e.g., Moving Out Sale - Complete Apartment Furniture" : "e.g., iPhone 13 Pro - Excellent Condition"}
                />
                <p className="text-xs text-gray-500 mt-1">At least 5 characters</p>
              </div>

              <div>
                <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-2">
                  {isBundleSaleCategory ? 'General Description' : 'Description'} <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  minLength={20}
                  rows={4}
                  value={formData.description}
                  onChange={handleChange}
                  className="input-field"
                  placeholder={isBundleSaleCategory ? "Describe the overall bundle, reason for selling, pickup details, etc." : "Describe your item in detail..."}
                />
                <p className="text-xs text-gray-500 mt-1">At least 20 characters</p>
              </div>
            </>
          )}

          {/* Bundle Sale Fields */}
          {isBundleSaleCategory && (
            <div className="bg-orange-50 border-2 border-orange-200 rounded-lg p-6 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <span className="text-2xl">📦</span>
                  <h3 className="text-lg font-semibold text-orange-900">Bundle Sale Items</h3>
                </div>
                <div className="text-sm text-orange-700">
                  {bundleItems.length} {bundleItems.length === 1 ? 'item' : 'items'} added
                </div>
              </div>

              {/* Add Item Button */}
              <button
                type="button"
                onClick={addBundleItem}
                className="w-full border-2 border-dashed border-orange-300 rounded-lg p-4 text-orange-600 hover:bg-orange-100 hover:border-orange-400 transition-colors"
              >
                <span className="text-xl mr-2">+</span>
                Add Item to Bundle
              </button>

              {/* Bundle Items List */}
              <div className="space-y-4">
                {bundleItems.map((item, index) => (
                  <div key={index} className="bg-white rounded-lg p-4 border border-orange-200">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="text-sm font-medium text-gray-700">Item #{index + 1}</h4>
                      <button
                        type="button"
                        onClick={() => removeBundleItem(index)}
                        className="text-red-600 hover:text-red-800 text-sm"
                      >
                        × Remove
                      </button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-3">
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Item Name <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          required
                          value={item.name}
                          onChange={(e) => updateBundleItem(index, 'name', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                          placeholder="e.g., Queen bed with mattress"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-xs font-medium text-gray-600 mb-1">
                          Condition <span className="text-red-500">*</span>
                        </label>
                        <select
                          required
                          value={item.condition}
                          onChange={(e) => updateBundleItem(index, 'condition', e.target.value)}
                          className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        >
                          <option value="Like New">Like New</option>
                          <option value="Good">Good</option>
                          <option value="Fair">Fair</option>
                          <option value="Poor">Poor</option>
                        </select>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Additional Details
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) => updateBundleItem(index, 'description', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="Size, color, brand, etc. (optional)"
                      />
                    </div>
                    
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-1">
                        Price for this item (optional if available separately)
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={item.price}
                        onChange={(e) => updateBundleItem(index, 'price', e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                        placeholder="e.g., 5000"
                      />
                      <p className="text-xs text-gray-500 mt-1">Leave empty if not selling separately</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Tips */}
              <div className="bg-white rounded-lg p-4 border border-orange-200">
                <p className="text-sm text-gray-700">
                  <strong>💡 Bundle Sale Tips:</strong>
                </p>
                <ul className="text-sm text-gray-600 mt-2 space-y-1 list-disc list-inside">
                  <li>Add each item separately with its own condition</li>
                  <li>Include measurements for furniture</li>
                  <li>Specify colors, brands, sizes in details</li>
                  <li>Upload photos showing all items</li>
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
                  {isBundleSaleCategory ? 'This bundle is FREE (giveaway)' : 'This item is FREE (giveaway)'}
                </span>
              </label>
            </div>
          </div>

          {/* Condition - hide for bundle sales since each item has its own */}
          {!isBundleSaleCategory && (
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
          )}

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
