'use client'

import { useEffect } from 'react'
import { useAuthStore } from '@/store/authStore'

export default function AuthHydration() {
  useEffect(() => {
    useAuthStore.persist.rehydrate()
    useAuthStore.getState().setHydrated()
  }, [])

  return null
}
