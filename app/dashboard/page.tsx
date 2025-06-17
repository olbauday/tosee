'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect, useRouter } from 'next/navigation'
import DashboardClient from './dashboard-client'
import type { User } from '@supabase/supabase-js'

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null)
  const [inventories, setInventories] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadUserAndInventories = async () => {
      // Check for real user first
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser(authUser)
        
        // Fetch user's inventories via API route to bypass RLS
        try {
          const response = await fetch('/api/inventories/list')
          const data = await response.json()
          
          if (response.ok && data.inventories) {
            setInventories(data.inventories)
          } else {
            console.error('Error fetching inventories:', data.error)
            setInventories([])
          }
        } catch (error) {
          console.error('Error fetching inventories:', error)
          setInventories([])
        }
      } else {
        // Check for dev user
        const devUser = localStorage.getItem('dev_user')
        if (devUser) {
          const parsedUser = JSON.parse(devUser)
          // Create a mock user object
          setUser({
            id: parsedUser.id,
            email: parsedUser.email,
            app_metadata: {},
            user_metadata: {},
            aud: 'authenticated',
            created_at: new Date().toISOString(),
          } as User)
          
          // For dev mode, start with empty inventories stored in localStorage
          const devInventories = localStorage.getItem('dev_inventories')
          if (devInventories) {
            setInventories(JSON.parse(devInventories))
          }
        } else {
          router.push('/')
          return
        }
      }
      
      setLoading(false)
    }

    loadUserAndInventories()

    // Set up listener for navigation changes to refresh inventories
    const handleFocus = () => {
      loadUserAndInventories()
    }

    window.addEventListener('focus', handleFocus)
    
    return () => {
      window.removeEventListener('focus', handleFocus)
    }
  }, [supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <DashboardClient user={user} inventories={inventories} />
}