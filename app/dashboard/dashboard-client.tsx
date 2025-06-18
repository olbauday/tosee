'use client'

import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Plus, Package, LogOut, Users, Copy, CheckCircle, Sparkles, ArrowRight, Calendar, Grid3X3, List, FolderOpen, Gamepad2, Trophy } from 'lucide-react'
import type { User } from '@supabase/supabase-js'

interface Inventory {
  id: string
  name: string | null
  share_code: string | null
  created_by: string | null
  partner_email: string | null
  created_at: string
  updated_at: string
  inventory_members: Array<{
    user_id: string
    role: string
    joined_at: string
  }>
}

interface DashboardClientProps {
  user: User
  inventories: Inventory[]
}

export default function DashboardClient({ user, inventories }: DashboardClientProps) {
  const [showNewInventory, setShowNewInventory] = useState(false)
  const [showJoinInventory, setShowJoinInventory] = useState(false)
  const [inventoryName, setInventoryName] = useState('')
  const [partnerEmail, setPartnerEmail] = useState('')
  const [creating, setCreating] = useState(false)
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [joinCode, setJoinCode] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      localStorage.removeItem('dev_user')
      localStorage.removeItem('dev_inventories')
      localStorage.removeItem('dev_items')
    } else {
      await supabase.auth.signOut()
    }
    router.push('/')
  }

  const handleCreateInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)

    try {
      // Check if we're in dev mode
      const devUser = localStorage.getItem('dev_user')
      if (devUser) {
        // Create inventory in localStorage for dev mode
        const newInventory = {
          id: `inv_${Date.now()}`,
          name: inventoryName || 'Untitled Inventory',
          share_code: Math.random().toString(36).substring(2, 8).toUpperCase(),
          created_by: user.id,
          partner_email: partnerEmail || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          inventory_members: [{
            user_id: user.id,
            role: 'owner',
            joined_at: new Date().toISOString()
          }]
        }

        // Get existing inventories
        const existingInventories = localStorage.getItem('dev_inventories')
        const inventories = existingInventories ? JSON.parse(existingInventories) : []
        
        // Add new inventory
        inventories.unshift(newInventory)
        localStorage.setItem('dev_inventories', JSON.stringify(inventories))
        
        // Navigate to inventory page
        router.push(`/inventory/${newInventory.id}`)
      } else {
        // Use API route to create inventory
        const response = await fetch('/api/inventories', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            name: inventoryName,
            partnerEmail: partnerEmail,
          }),
        })

        const data = await response.json()

        if (response.ok && data.inventory) {
          // Refresh the page to show the new inventory
          router.refresh()
          router.push(`/inventory/${data.inventory.id}`)
        } else {
          console.error('Error creating inventory:', data.error)
          alert(`Failed to create inventory: ${data.error || 'Unknown error'}`)
        }
      }
    } catch (error) {
      console.error('Error creating inventory:', error)
      alert('Failed to create inventory. Please try again.')
    }
    
    setCreating(false)
  }

  const handleJoinInventory = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!joinCode.trim()) return
    
    router.push(`/join/${joinCode.toUpperCase()}`)
  }

  const copyShareCode = (code: string) => {
    navigator.clipboard.writeText(code)
    setCopiedCode(code)
    setTimeout(() => setCopiedCode(null), 2000)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1600px] mx-auto px-6 lg:px-8">
          <div className="flex justify-between items-center py-4 lg:py-6">
            <div className="flex items-center gap-4">
              <Package className="w-8 h-8 text-amber-500" />
              <div>
                <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">My Inventories</h1>
                <p className="text-sm text-gray-600 mt-0.5">Manage your decluttering projects</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition"
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                <span className="hidden lg:inline">{viewMode === 'grid' ? 'List' : 'Grid'} View</span>
              </button>
              <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-gray-50 rounded-lg">
                <span className="text-sm text-gray-600">{user.email}</span>
              </div>
              <button
                onClick={handleSignOut}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition"
                title="Sign out"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-6 lg:px-8 py-8 lg:py-12">
        {/* Stats Bar */}
        {inventories.length > 0 && (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <FolderOpen className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">{inventories.length}</p>
                  <p className="text-sm text-gray-600">Total Inventories</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-yellow-100 rounded-xl flex items-center justify-center">
                  <Users className="w-6 h-6 text-yellow-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {inventories.reduce((acc, inv) => acc + (inv.inventory_members?.length || 0), 0)}
                  </p>
                  <p className="text-sm text-gray-600">Total Members</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-green-100 rounded-xl flex items-center justify-center">
                  <CheckCircle className="w-6 h-6 text-green-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">Active</p>
                  <p className="text-sm text-gray-600">Status</p>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <Calendar className="w-6 h-6 text-amber-600" />
                </div>
                <div>
                  <p className="text-2xl font-bold text-gray-900">
                    {new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  </p>
                  <p className="text-sm text-gray-600">Today</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {inventories.length === 0 && !showNewInventory && !showJoinInventory ? (
          <div className="text-center py-20">
            <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-3xl mb-6">
              <Sparkles className="w-12 h-12 text-amber-600" />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Welcome to Tosslee!</h2>
            <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
              Start your decluttering journey with fast, confident decisions
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={() => setShowNewInventory(true)}
                className="inline-flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="w-5 h-5 mr-2" />
                Create First Inventory
              </button>
              <button
                onClick={() => setShowJoinInventory(true)}
                className="inline-flex items-center bg-white border-2 border-gray-200 text-gray-700 px-8 py-4 rounded-2xl font-semibold text-lg hover:bg-gray-50 hover:border-gray-300 hover:shadow-lg transition-all duration-200"
              >
                <Users className="w-5 h-5 mr-2" />
                Join with Code
              </button>
            </div>
          </div>
        ) : (
          <>
            {!showNewInventory && !showJoinInventory && (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                <div>
                  <h2 className="text-xl font-semibold text-gray-900">Your Inventories</h2>
                  <p className="text-gray-600 mt-1 text-sm sm:text-base">Click on any inventory to manage items</p>
                </div>
                <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                  <button
                    onClick={() => setShowJoinInventory(true)}
                    className="inline-flex items-center justify-center bg-white border-2 border-gray-200 text-gray-700 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 hover:border-gray-300 hover:shadow transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Users className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    Join with Code
                  </button>
                  <button
                    onClick={() => setShowNewInventory(true)}
                    className="inline-flex items-center justify-center bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 sm:px-6 py-3 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200 text-sm sm:text-base w-full sm:w-auto"
                  >
                    <Plus className="w-4 sm:w-5 h-4 sm:h-5 mr-2" />
                    New Inventory
                  </button>
                </div>
              </div>
            )}

            {showNewInventory && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Create New Inventory</h2>
                <form onSubmit={handleCreateInventory} className="space-y-6">
                  <div>
                    <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                      Inventory Name
                    </label>
                    <input
                      id="name"
                      type="text"
                      value={inventoryName}
                      onChange={(e) => setInventoryName(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      placeholder="e.g., Garage Cleanout, Kitchen Items"
                      autoFocus
                    />
                  </div>
                  
                  <div>
                    <label htmlFor="partner" className="block text-sm font-medium text-gray-700 mb-2">
                      Partner Email (optional)
                    </label>
                    <input
                      id="partner"
                      type="email"
                      value={partnerEmail}
                      onChange={(e) => setPartnerEmail(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
                      placeholder="partner@example.com"
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      They'll receive an invitation to join and vote on items
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      disabled={creating}
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      {creating ? 'Creating...' : 'Create Inventory'}
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowNewInventory(false)
                        setInventoryName('')
                        setPartnerEmail('')
                      }}
                      className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {showJoinInventory && (
              <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 max-w-2xl mx-auto">
                <h2 className="text-2xl font-bold mb-6">Join Existing Inventory</h2>
                <form onSubmit={handleJoinInventory} className="space-y-6">
                  <div>
                    <label htmlFor="code" className="block text-sm font-medium text-gray-700 mb-2">
                      Share Code
                    </label>
                    <input
                      id="code"
                      type="text"
                      value={joinCode}
                      onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                      className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all text-center font-mono text-xl uppercase"
                      placeholder="ENTER CODE"
                      maxLength={6}
                      autoFocus
                    />
                    <p className="text-sm text-gray-500 mt-2">
                      Enter the 6-character code shared by the inventory owner
                    </p>
                  </div>

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                    >
                      Join Inventory
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setShowJoinInventory(false)
                        setJoinCode('')
                      }}
                      className="px-6 py-3 border border-gray-200 rounded-xl font-semibold hover:bg-gray-50 transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </form>
              </div>
            )}

            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {inventories.map((inventory) => {
                  const memberCount = inventory.inventory_members?.length || 0
                  const isOwner = inventory.created_by === user.id
                  
                  return (
                    <div
                      key={inventory.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      onClick={() => router.push(`/inventory/${inventory.id}`)}
                    >
                      <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-yellow-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                      
                      <div className="relative p-6">
                        <div className="flex items-start justify-between mb-4">
                          <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors">
                            {inventory.name || 'Untitled Inventory'}
                          </h3>
                          <Package className="w-5 h-5 text-gray-400 group-hover:text-amber-600 transition-colors" />
                        </div>
                        
                        {/* Game Mode Button */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/game/${inventory.id}`);
                          }}
                          className="w-full mb-4 bg-gradient-to-r from-purple-500 to-pink-500 text-white px-4 py-2 rounded-lg font-medium hover:shadow-md transition-all flex items-center justify-center gap-2"
                        >
                          <Gamepad2 className="w-4 h-4" />
                          Play Game Mode
                        </button>
                        
                        <div className="space-y-3 mb-6">
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Users className="w-4 h-4" />
                            <span>{memberCount} member{memberCount !== 1 ? 's' : ''}</span>
                          </div>
                          <div className="flex items-center gap-2 text-sm text-gray-600">
                            <Calendar className="w-4 h-4" />
                            <span>Created {new Date(inventory.created_at).toLocaleDateString()}</span>
                          </div>
                        </div>

                        {inventory.share_code && isOwner && (
                          <div className="border-t pt-4">
                            <p className="text-xs font-medium text-gray-500 mb-2">SHARE CODE</p>
                            <div className="flex items-center gap-2">
                              <code className="bg-gray-100 px-3 py-1.5 rounded-lg text-sm font-mono flex-1 text-center">
                                {inventory.share_code}
                              </code>
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  copyShareCode(inventory.share_code!)
                                }}
                                className="p-1.5 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-all"
                                title="Copy share code"
                              >
                                {copiedCode === inventory.share_code ? (
                                  <CheckCircle className="w-4 h-4 text-green-600" />
                                ) : (
                                  <Copy className="w-4 h-4" />
                                )}
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="flex items-center justify-end mt-4 text-amber-600 font-medium text-sm">
                          <span className="group-hover:translate-x-1 transition-transform">View Items</span>
                          <ArrowRight className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="space-y-4">
                {inventories.map((inventory) => {
                  const memberCount = inventory.inventory_members?.length || 0
                  const isOwner = inventory.created_by === user.id
                  
                  return (
                    <div
                      key={inventory.id}
                      className="bg-white rounded-2xl shadow-sm hover:shadow-lg transition-all duration-300 cursor-pointer group"
                      onClick={() => router.push(`/inventory/${inventory.id}`)}
                    >
                      <div className="p-6 flex items-center justify-between">
                        <div className="flex items-center gap-6">
                          <div className="w-16 h-16 bg-gradient-to-br from-amber-100 to-yellow-100 rounded-2xl flex items-center justify-center">
                            <Package className="w-8 h-8 text-amber-600" />
                          </div>
                          <div>
                            <h3 className="text-xl font-bold text-gray-900 group-hover:text-amber-600 transition-colors mb-1">
                              {inventory.name || 'Untitled Inventory'}
                            </h3>
                            <div className="flex items-center gap-4 text-sm text-gray-600">
                              <span className="flex items-center gap-1">
                                <Users className="w-4 h-4" />
                                {memberCount} member{memberCount !== 1 ? 's' : ''}
                              </span>
                              <span className="flex items-center gap-1">
                                <Calendar className="w-4 h-4" />
                                {new Date(inventory.created_at).toLocaleDateString()}
                              </span>
                              {inventory.share_code && isOwner && (
                                <span className="flex items-center gap-1">
                                  <code className="bg-gray-100 px-2 py-0.5 rounded text-xs font-mono">
                                    {inventory.share_code}
                                  </code>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      copyShareCode(inventory.share_code!)
                                    }}
                                    className="p-1 text-gray-500 hover:text-gray-700 transition"
                                  >
                                    {copiedCode === inventory.share_code ? (
                                      <CheckCircle className="w-3 h-3 text-green-600" />
                                    ) : (
                                      <Copy className="w-3 h-3" />
                                    )}
                                  </button>
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                        <ArrowRight className="w-5 h-5 text-gray-400 group-hover:text-amber-600 group-hover:translate-x-1 transition-all" />
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
}