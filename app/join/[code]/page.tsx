'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Package, Users } from 'lucide-react'

interface PageProps {
  params: Promise<{ code: string }>
}

export default function JoinInventoryPage({ params }: PageProps) {
  const [loading, setLoading] = useState(true)
  const [inventory, setInventory] = useState<any>(null)
  const [error, setError] = useState('')
  const [joining, setJoining] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const loadInventory = async () => {
      const { code } = await params
      
      // Check if user is authenticated
      const { data: { user } } = await supabase.auth.getUser()
      const devUser = localStorage.getItem('dev_user')
      
      if (!user && !devUser) {
        router.push('/')
        return
      }

      // Check dev mode first
      if (devUser) {
        const devInventories = localStorage.getItem('dev_inventories')
        console.log('Looking for code:', code)
        console.log('Dev inventories:', devInventories)
        
        if (devInventories) {
          const inventories = JSON.parse(devInventories)
          console.log('Parsed inventories:', inventories)
          const foundInventory = inventories.find((inv: any) => inv.share_code === code)
          console.log('Found inventory:', foundInventory)
          
          if (foundInventory) {
            // Check if already a member
            const devUserData = JSON.parse(devUser)
            const isMember = foundInventory.inventory_members?.some(
              (member: any) => member.user_id === devUserData.id
            )
            
            if (isMember) {
              router.push(`/inventory/${foundInventory.id}`)
              return
            }
            
            setInventory(foundInventory)
            setLoading(false)
            return
          }
        }
        
        // If we're in dev mode but didn't find the inventory, show error
        setError('Invalid share code')
        setLoading(false)
        return
      }

      // Check Supabase
      if (user) {
        try {
          console.log('Querying Supabase for share code:', code)
          
          // First, just get the inventory without the members relation
          const { data: foundInventory, error: queryError } = await supabase
            .from('inventories')
            .select('*')
            .eq('share_code', code)
            .single()

          console.log('Inventory query result:', { foundInventory, queryError })

          if (queryError) {
            // Check if it's a "not found" error (PGRST116) vs actual error
            if (queryError.code === 'PGRST116') {
              console.log('No inventory found with share code:', code)
              setError('Invalid share code - no inventory found')
            } else {
              console.error('Supabase query error:', queryError)
              setError('Error looking up inventory. Please try again.')
            }
          } else if (foundInventory) {
            console.log('Found inventory:', foundInventory)
            
            // Now separately check if user is already a member
            const { data: memberCheck } = await supabase
              .from('inventory_members')
              .select('*')
              .eq('inventory_id', foundInventory.id)
              .eq('user_id', user.id)
              .single()
            
            if (memberCheck) {
              console.log('User is already a member, redirecting...')
              router.push(`/inventory/${foundInventory.id}`)
              return
            }
            
            // Get member count separately
            const { count: memberCount } = await supabase
              .from('inventory_members')
              .select('*', { count: 'exact', head: true })
              .eq('inventory_id', foundInventory.id)
            
            // Add member count to inventory object
            setInventory({
              ...foundInventory,
              inventory_members: Array(memberCount || 0).fill({})
            })
          } else {
            console.log('No inventory found and no error - this is unexpected')
            setError('Invalid share code')
          }
        } catch (err) {
          console.error('Error fetching inventory:', err)
          setError('Error looking up inventory. Please try again.')
        }
      }
      
      setLoading(false)
    }
    
    loadInventory()
  }, [])

  const handleJoin = async () => {
    setJoining(true)

    // Check if dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser && inventory) {
      // Update dev inventory
      const devUserData = JSON.parse(devUser)
      const devInventories = localStorage.getItem('dev_inventories')
      if (devInventories) {
        const inventories = JSON.parse(devInventories)
        const invIndex = inventories.findIndex((inv: any) => inv.id === inventory.id)
        
        if (invIndex !== -1) {
          inventories[invIndex].inventory_members.push({
            user_id: devUserData.id,
            role: 'partner',
            joined_at: new Date().toISOString()
          })
          localStorage.setItem('dev_inventories', JSON.stringify(inventories))
          router.push(`/inventory/${inventory.id}`)
          return
        }
      }
    }

    // Supabase mode
    const { data: { user } } = await supabase.auth.getUser()
    if (user && inventory) {
      const { error } = await supabase.from('inventory_members').insert({
        inventory_id: inventory.id,
        user_id: user.id,
        role: 'partner',
      })

      if (!error) {
        router.push(`/inventory/${inventory.id}`)
      }
    }
    
    setJoining(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    )
  }

  if (error || !inventory) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-red-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Invalid Share Code</h1>
          <p className="text-gray-600 mb-8">
            The share code you entered doesn't match any inventory.
          </p>
          <a
            href="/dashboard"
            className="inline-block bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 py-3 px-8 rounded-xl font-semibold hover:shadow-lg transition-all"
          >
            Back to Dashboard
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 lg:p-10 max-w-md lg:max-w-lg w-full">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl flex items-center justify-center mx-auto mb-6">
            <Package className="w-10 h-10 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-3">Join Inventory</h1>
          <p className="text-gray-600 lg:text-lg">You've been invited to join a Tosslee inventory</p>
        </div>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-8">
          <h2 className="font-bold text-xl mb-3">{inventory.name || 'Untitled Inventory'}</h2>
          <div className="flex items-center gap-2 text-sm text-gray-700">
            <Users className="w-4 h-4 text-amber-600" />
            <span>{inventory.inventory_members?.length || 0} member(s) already joined</span>
          </div>
          <div className="mt-4 pt-4 border-t border-amber-200">
            <p className="text-xs font-medium text-gray-500 mb-1">SHARE CODE</p>
            <code className="text-lg font-mono font-bold text-amber-700">{inventory.share_code}</code>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleJoin}
            disabled={joining}
            className="w-full bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 py-3 px-6 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
          >
            {joining ? 'Joining...' : 'Join This Inventory'}
          </button>
          
          <button
            onClick={() => router.push('/dashboard')}
            className="w-full border-2 border-gray-200 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-50 transition-all"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  )
}