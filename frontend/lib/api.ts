import axios from 'axios'

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000'

export const api = axios.create({
  baseURL: `${API_URL}/api/v1`,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token')
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Auth
export const login = async (email: string, password: string) => {
  const { data } = await api.post('/auth/login', { email, password })
  return data
}

export const register = async (userData: any) => {
  const { data } = await api.post('/auth/register', userData)
  return data
}

export const getCurrentUser = async () => {
  const { data } = await api.get('/auth/me')
  return data
}

// Categories
export const fetchCategories = async () => {
  const { data } = await api.get('/categories')
  return data
}

export const fetchCategoryBySlug = async (slug: string) => {
  const { data } = await api.get(`/categories/${slug}`)
  return data
}

// Listings
export const fetchListings = async (params?: any) => {
  const { data } = await api.get('/listings', { params })
  return data
}

export const fetchFeaturedListings = async () => {
  const { data } = await api.get('/listings/featured')
  return data
}

export const fetchListingById = async (id: string) => {
  const { data } = await api.get(`/listings/${id}`)
  return data
}

export const createListing = async (listingData: FormData) => {
  const { data } = await api.post('/listings', listingData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const updateListing = async (id: string, listingData: any) => {
  const { data} = await api.put(`/listings/${id}`, listingData)
  return data
}

export const deleteListing = async (id: string) => {
  const { data } = await api.delete(`/listings/${id}`)
  return data
}

export const toggleFavorite = async (id: string) => {
  const { data } = await api.post(`/listings/${id}/favorite`)
  return data
}

export const fetchUserFavorites = async () => {
  const { data } = await api.get('/listings/user/favorites')
  return data
}

// User
export const fetchUserProfile = async () => {
  const { data } = await api.get('/users/profile')
  return data
}

export const updateUserProfile = async (profileData: FormData) => {
  const { data } = await api.put('/users/profile', profileData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })
  return data
}

export const fetchUserListings = async (userId: string) => {
  const { data } = await api.get(`/users/${userId}/listings`)
  return data
}
