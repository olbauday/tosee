'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { redirect, useRouter, useParams } from 'next/navigation'
import InventoryClient from './inventory-client'
import type { User } from '@supabase/supabase-js'

export default function InventoryPage() {
  const params = useParams()
  const id = params.id as string
  const [user, setUser] = useState<User | null>(null)
  const [inventory, setInventory] = useState<any>(null)
  const [items, setItems] = useState<any[]>([])
  const [locations, setLocations] = useState<any[]>([])
  const [tags, setTags] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadInventoryData = async () => {
      // Check for real user first
      const { data: { user: authUser } } = await supabase.auth.getUser()
      
      if (authUser) {
        setUser(authUser)
        
        // Fetch inventory data via API route to bypass RLS
        try {
          const response = await fetch(`/api/inventories/${id}`)
          const data = await response.json()
          
          if (response.ok) {
            setInventory(data.inventory)
            setItems(data.items)
            setLocations(data.locations)
            setTags(data.tags)
          } else {
            console.error('Error fetching inventory:', data.error)
            router.push('/dashboard')
            return
          }
        } catch (error) {
          console.error('Error fetching inventory:', error)
          router.push('/dashboard')
          return
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
          
          // Load inventory from localStorage
          const devInventories = localStorage.getItem('dev_inventories')
          if (devInventories) {
            const inventories = JSON.parse(devInventories)
            const foundInventory = inventories.find((inv: any) => inv.id === id)
            
            if (foundInventory) {
              setInventory(foundInventory)
              
              // Load items from localStorage
              const devItems = localStorage.getItem(`dev_items_${id}`)
              if (devItems) {
                setItems(JSON.parse(devItems))
              }
              
              // Load locations from localStorage
              const devLocations = localStorage.getItem(`dev_locations_${id}`)
              if (devLocations) {
                setLocations(JSON.parse(devLocations))
              }
              
              // Load tags from localStorage
              const devTags = localStorage.getItem(`dev_tags_${id}`)
              if (devTags) {
                setTags(JSON.parse(devTags))
              }
            } else {
              router.push('/dashboard')
              return
            }
          } else {
            router.push('/dashboard')
            return
          }
        } else {
          router.push('/')
          return
        }
      }
      
      setLoading(false)
    }

    loadInventoryData()
  }, [id, supabase, router])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!user || !inventory) {
    return null
  }

  return (
    <InventoryClient 
      user={user}
      inventory={inventory}
      items={items}
      locations={locations}
      tags={tags}
    />
  )
}