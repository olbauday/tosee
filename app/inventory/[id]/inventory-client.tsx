'use client'

import { useState, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { 
  Camera, Upload, X, Plus, Filter, Home, Package, 
  Check, XCircle, HelpCircle, MessageCircle, Tag,
  ChevronLeft, Grid, List, Sparkles, Users, LayoutGrid,
  Grid3X3, BarChart3, Gamepad2, Trophy, Zap
} from 'lucide-react'
import type { User } from '@supabase/supabase-js'
import PhotoUpload from '@/components/PhotoUpload'
import ItemCard from '@/components/ItemCard'
import ItemDetail from '@/components/ItemDetail'

interface InventoryClientProps {
  user: User
  inventory: any
  items: any[]
  locations: any[]
  tags: any[]
}

export default function InventoryClient({ 
  user, 
  inventory, 
  items: initialItems, 
  locations: initialLocations,
  tags: initialTags 
}: InventoryClientProps) {
  const [items, setItems] = useState(initialItems)
  const [locations, setLocations] = useState(initialLocations)
  const [tags, setTags] = useState(initialTags)
  const [showUpload, setShowUpload] = useState(false)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [filter, setFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [selectedLocation, setSelectedLocation] = useState<string>('')
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const supabase = createClient()
  const router = useRouter()

  const handleUploadComplete = (newItems: any[]) => {
    setItems([...newItems, ...items])
    setShowUpload(false)
  }

  const handleVote = async (itemId: string, vote: 'keep' | 'toss' | 'maybe') => {
    // Check if we're in dev mode
    const devUser = localStorage.getItem('dev_user')
    if (devUser) {
      // Update local state only for dev mode
      const updatedItems = items.map(item => {
        if (item.id === itemId) {
          const existingVotes = item.votes.filter((v: any) => v.user_id !== user.id)
          return { ...item, votes: [...existingVotes, { user_id: user.id, vote }] }
        }
        return item
      })
      setItems(updatedItems)
      
      // Save to localStorage
      localStorage.setItem(`dev_items_${inventory.id}`, JSON.stringify(updatedItems))
    } else {
      // Real Supabase logic via API route
      const response = await fetch('/api/votes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          item_id: itemId,
          vote: vote,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setItems(items.map(item => {
          if (item.id === itemId) {
            const existingVotes = item.votes.filter((v: any) => v.user_id !== user.id)
            return { ...item, votes: [...existingVotes, { user_id: user.id, vote }] }
          }
          return item
        }))
      } else {
        console.error('Error voting:', data.error)
      }
    }
  }

  // Filter items based on selected criteria
  const filteredItems = items.filter(item => {
    // Location filter
    if (selectedLocation && item.location !== selectedLocation) return false
    
    // Tag filter
    if (selectedTags.length > 0) {
      const itemTagNames = item.item_tags?.map((it: any) => it.tags?.name) || []
      if (!selectedTags.some(tag => itemTagNames.includes(tag))) return false
    }
    
    // Status filter
    if (filter === 'pending') {
      return item.votes.length === 0 || item.votes.length === 1
    } else if (filter === 'agreed-keep') {
      return item.votes.length === 2 && 
        item.votes.every((v: any) => v.vote === 'keep')
    } else if (filter === 'agreed-toss') {
      return item.votes.length === 2 && 
        item.votes.every((v: any) => v.vote === 'toss')
    } else if (filter === 'disagreement') {
      return item.votes.length === 2 && 
        item.votes[0].vote !== item.votes[1].vote
    }
    
    return true
  })

  const getUserVote = (item: any) => {
    const vote = item.votes.find((v: any) => v.user_id === user.id)
    return vote?.vote || null
  }

  const getItemStatus = (item: any) => {
    if (item.votes.length < 2) return 'pending'
    if (item.votes.every((v: any) => v.vote === 'keep')) return 'keep'
    if (item.votes.every((v: any) => v.vote === 'toss')) return 'toss'
    return 'discuss'
  }

  // Get stats for the header
  const stats = {
    total: items.length,
    pending: items.filter(item => item.votes.length < 2).length,
    agreed: items.filter(item => item.votes.length === 2 && item.votes[0].vote === item.votes[1].vote).length,
    discuss: items.filter(item => item.votes.length === 2 && item.votes[0].vote !== item.votes[1].vote).length,
    keep: items.filter(item => item.votes.length === 2 && item.votes.every((v: any) => v.vote === 'keep')).length,
    toss: items.filter(item => item.votes.length === 2 && item.votes.every((v: any) => v.vote === 'toss')).length,
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
          <div className="flex items-center justify-between py-4 lg:py-5">
            <div className="flex items-center gap-4">
              <button
                onClick={() => router.push('/dashboard')}
                className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-lg transition-all"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <div>
                <h1 className="text-xl lg:text-2xl font-bold text-gray-900">
                  {inventory?.name || 'Inventory'}
                </h1>
                <p className="text-sm text-gray-500">
                  {inventory?.members?.length || 0} members • {items.length} items
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2 lg:gap-3">
              <button
                onClick={() => router.push(`/game/${inventory.id}`)}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 text-white rounded-lg hover:shadow-lg transition-all"
                title="Play decluttering game"
              >
                <Gamepad2 className="w-5 h-5" />
                <span className="hidden lg:inline">Play Game</span>
              </button>
              <button
                onClick={() => setViewMode(viewMode === 'grid' ? 'list' : 'grid')}
                className="hidden sm:flex items-center gap-2 px-4 py-2 text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                title={`Switch to ${viewMode === 'grid' ? 'list' : 'grid'} view`}
              >
                {viewMode === 'grid' ? <List className="w-5 h-5" /> : <Grid3X3 className="w-5 h-5" />}
                <span className="hidden lg:inline">{viewMode === 'grid' ? 'List' : 'Grid'} View</span>
              </button>
              <button
                onClick={() => setShowUpload(true)}
                className="inline-flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 lg:px-6 py-2.5 rounded-xl font-semibold hover:shadow-lg hover:scale-[1.02] transition-all duration-200"
              >
                <Plus className="w-5 h-5 lg:mr-2" />
                <span className="hidden lg:inline">Add Items</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1800px] mx-auto px-6 lg:px-8">
        {/* Game Progress Card */}
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-2xl p-6 mb-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold mb-1">Ready to Declutter?</h3>
              <p className="text-white/80">Turn decision-making into a fun game with XP and achievements!</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <Trophy className="w-8 h-8 mx-auto mb-1" />
                <p className="text-sm font-medium">Level {user?.user_metadata?.level || 1}</p>
              </div>
              <div className="text-center">
                <Zap className="w-8 h-8 mx-auto mb-1" />
                <p className="text-sm font-medium">{user?.user_metadata?.total_xp || 0} XP</p>
              </div>
              <button
                onClick={() => router.push(`/game/${inventory.id}`)}
                className="bg-white/20 backdrop-blur hover:bg-white/30 px-6 py-3 rounded-xl font-semibold transition-all"
              >
                Start Playing →
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 pb-6">
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Package className="w-5 h-5 text-gray-400" />
              <span className="text-2xl font-bold text-gray-900">{stats.total}</span>
            </div>
            <p className="text-sm text-gray-600">Total Items</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <HelpCircle className="w-5 h-5 text-yellow-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.pending}</span>
            </div>
            <p className="text-sm text-gray-600">Pending</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <Check className="w-5 h-5 text-green-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.keep}</span>
            </div>
            <p className="text-sm text-gray-600">To Keep</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <X className="w-5 h-5 text-red-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.toss}</span>
            </div>
            <p className="text-sm text-gray-600">To Toss</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <MessageCircle className="w-5 h-5 text-orange-500" />
              <span className="text-2xl font-bold text-gray-900">{stats.discuss}</span>
            </div>
            <p className="text-sm text-gray-600">Discuss</p>
          </div>
          <div className="bg-white rounded-xl p-4 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <BarChart3 className="w-5 h-5 text-indigo-500" />
              <span className="text-2xl font-bold text-gray-900">
                {stats.total > 0 ? Math.round((stats.agreed / stats.total) * 100) : 0}%
              </span>
            </div>
            <p className="text-sm text-gray-600">Agreed</p>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-xl shadow-sm p-4 mb-6">
          <div className="flex flex-wrap gap-3 items-center">
            <select
              value={filter}
              onChange={(e) => setFilter(e.target.value)}
              className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
            >
              <option value="all">All Items</option>
              <option value="pending">Pending Decision</option>
              <option value="agreed-keep">Agreed - Keep</option>
              <option value="agreed-toss">Agreed - Toss</option>
              <option value="disagreement">Disagreement</option>
            </select>

            {locations.length > 0 && (
              <select
                value={selectedLocation}
                onChange={(e) => setSelectedLocation(e.target.value)}
                className="px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 transition-all"
              >
                <option value="">All Locations</option>
                {locations.map(loc => (
                  <option key={loc.id} value={loc.name}>{loc.name}</option>
                ))}
              </select>
            )}

            {tags.length > 0 && (
              <div className="flex items-center gap-2 flex-1">
                <Tag className="w-4 h-4 text-gray-500" />
                <div className="flex flex-wrap gap-2">
                  {tags.map(tag => (
                    <button
                      key={tag.id}
                      onClick={() => {
                        setSelectedTags(prev => 
                          prev.includes(tag.name) 
                            ? prev.filter(t => t !== tag.name)
                            : [...prev, tag.name]
                        )
                      }}
                      className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                        selectedTags.includes(tag.name)
                          ? 'bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {tag.name}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Items Grid/List */}
        <div className="pb-8">
          {filteredItems.length === 0 ? (
            <div className="text-center py-20">
              <div className="inline-flex items-center justify-center w-24 h-24 bg-gray-100 rounded-3xl mb-6">
                {items.length === 0 ? (
                  <Sparkles className="w-12 h-12 text-gray-400" />
                ) : (
                  <Filter className="w-12 h-12 text-gray-400" />
                )}
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                {items.length === 0 ? "Let's get started!" : "No items match your filters"}
              </h2>
              <p className="text-gray-600 max-w-md mx-auto mb-8">
                {items.length === 0 
                  ? "Add photos of items you're deciding on. Your partner will be able to vote on them too."
                  : "Try adjusting your filters to see more items"}
              </p>
              {items.length === 0 && (
                <button
                  onClick={() => setShowUpload(true)}
                  className="inline-flex items-center bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-8 py-4 rounded-2xl font-semibold text-lg hover:shadow-xl hover:scale-[1.02] transition-all duration-200"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  Add Your First Items
                </button>
              )}
            </div>
          ) : (
            <div className={viewMode === 'grid' 
              ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 3xl:grid-cols-8 gap-4 lg:gap-6'
              : 'grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-4 lg:gap-6'
            }>
              {filteredItems.map((item, index) => (
                <div
                  key={item.id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${Math.min(index * 0.02, 0.3)}s` }}
                >
                  <ItemCard
                    item={item}
                    userVote={getUserVote(item)}
                    status={getItemStatus(item)}
                    viewMode={viewMode}
                    onVote={(vote) => handleVote(item.id, vote)}
                    onClick={() => setSelectedItem(item)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload Modal */}
      {showUpload && (
        <PhotoUpload
          inventoryId={inventory.id}
          userId={user.id}
          locations={locations}
          tags={tags}
          onClose={() => setShowUpload(false)}
          onUploadComplete={handleUploadComplete}
          onLocationAdd={(newLocation) => setLocations([...locations, newLocation])}
          onTagAdd={(newTag) => setTags([...tags, newTag])}
        />
      )}

      {/* Item Detail Modal */}
      {selectedItem && (
        <ItemDetail
          item={selectedItem}
          user={user}
          inventory={inventory}
          onClose={() => setSelectedItem(null)}
          onUpdate={(updatedItem) => {
            setItems(items.map(item => 
              item.id === updatedItem.id ? updatedItem : item
            ))
            setSelectedItem(updatedItem)
          }}
          onDelete={(itemId) => {
            setItems(items.filter(item => item.id !== itemId))
            setSelectedItem(null)
          }}
        />
      )}
    </div>
  )
}