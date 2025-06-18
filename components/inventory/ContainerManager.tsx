'use client'

import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Package2, Plus, MapPin, Edit2, Trash2, Search, Box } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface Container {
  id: string
  name: string
  description?: string
  location_id?: string
  location_name?: string
  color?: string
  icon?: string
  item_count: number
}

interface ContainerManagerProps {
  containers: Container[]
  locations: Array<{ id: string; name: string }>
  onContainerUpdate: () => void
  onSelectContainer?: (containerId: string) => void
}

export default function ContainerManager({ 
  containers, 
  locations, 
  onContainerUpdate,
  onSelectContainer 
}: ContainerManagerProps) {
  const [isCreating, setIsCreating] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [newContainer, setNewContainer] = useState({
    name: '',
    description: '',
    location_id: '',
    color: '#FCA311',
    icon: 'box'
  })
  const supabase = createClient()

  const containerIcons = [
    { id: 'box', icon: Box, name: 'Box' },
    { id: 'package', icon: Package2, name: 'Package' },
    { id: 'drawer', icon: '🗄️', name: 'Drawer' },
    { id: 'shelf', icon: '📚', name: 'Shelf' },
    { id: 'closet', icon: '🚪', name: 'Closet' },
    { id: 'bin', icon: '🗑️', name: 'Bin' },
    { id: 'bag', icon: '👜', name: 'Bag' },
    { id: 'suitcase', icon: '💼', name: 'Suitcase' }
  ]

  const colors = [
    '#FCA311', '#E85D75', '#A78BFA', '#60A5FA', 
    '#34D399', '#FBBF24', '#F87171', '#818CF8'
  ]

  const filteredContainers = containers.filter(container =>
    container.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    container.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
    container.location_name?.toLowerCase().includes(searchQuery.toLowerCase())
  )

  const handleCreate = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { error } = await supabase
        .from('containers')
        .insert({
          user_id: user.id,
          ...newContainer
        })

      if (!error) {
        setIsCreating(false)
        setNewContainer({
          name: '',
          description: '',
          location_id: '',
          color: '#FCA311',
          icon: 'box'
        })
        onContainerUpdate()
      }
    } catch (error) {
      console.error('Error creating container:', error)
    }
  }

  const handleUpdate = async (container: Container) => {
    try {
      const { error } = await supabase
        .from('containers')
        .update({
          name: container.name,
          description: container.description,
          location_id: container.location_id,
          color: container.color,
          icon: container.icon
        })
        .eq('id', container.id)

      if (!error) {
        setEditingId(null)
        onContainerUpdate()
      }
    } catch (error) {
      console.error('Error updating container:', error)
    }
  }

  const handleDelete = async (containerId: string) => {
    if (!confirm('Are you sure? Items in this container will be unassigned.')) return

    try {
      const { error } = await supabase
        .from('containers')
        .delete()
        .eq('id', containerId)

      if (!error) {
        onContainerUpdate()
      }
    } catch (error) {
      console.error('Error deleting container:', error)
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Storage Containers</h2>
          <p className="text-gray-600">Organize your items in virtual containers</p>
        </div>
        <button
          onClick={() => setIsCreating(true)}
          className="bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all flex items-center gap-2"
        >
          <Plus className="w-5 h-5" />
          New Container
        </button>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search containers..."
          className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 transition-all"
        />
      </div>

      {/* Containers Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filteredContainers.map((container) => (
            <motion.div
              key={container.id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              whileHover={{ y: -2 }}
              onClick={() => onSelectContainer?.(container.id)}
              className="cursor-pointer"
            >
              <div className="bg-white rounded-2xl shadow-md hover:shadow-lg transition-all p-6">
                {editingId === container.id ? (
                  // Edit Mode
                  <div className="space-y-4">
                    <input
                      type="text"
                      value={container.name}
                      onChange={(e) => {
                        const updated = containers.map(c => 
                          c.id === container.id ? { ...c, name: e.target.value } : c
                        )
                        // Update local state
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    />
                    <textarea
                      value={container.description || ''}
                      onChange={(e) => {
                        const updated = containers.map(c => 
                          c.id === container.id ? { ...c, description: e.target.value } : c
                        )
                        // Update local state
                      }}
                      className="w-full px-3 py-2 border rounded-lg resize-none"
                      rows={2}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <select
                      value={container.location_id || ''}
                      onChange={(e) => {
                        const updated = containers.map(c => 
                          c.id === container.id ? { ...c, location_id: e.target.value } : c
                        )
                        // Update local state
                      }}
                      className="w-full px-3 py-2 border rounded-lg"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <option value="">No location</option>
                      {locations.map(loc => (
                        <option key={loc.id} value={loc.id}>{loc.name}</option>
                      ))}
                    </select>
                    <div className="flex gap-2">
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          handleUpdate(container)
                        }}
                        className="flex-1 bg-green-500 text-white py-2 rounded-lg"
                      >
                        Save
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          setEditingId(null)
                        }}
                        className="flex-1 bg-gray-300 text-gray-700 py-2 rounded-lg"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                ) : (
                  // View Mode
                  <>
                    <div className="flex items-start justify-between mb-4">
                      <div 
                        className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
                        style={{ backgroundColor: container.color || '#FCA311' }}
                      >
                        {(() => {
                          if (container.icon === 'box') {
                            return <Box className="w-6 h-6 text-white" />
                          } else if (container.icon === 'package') {
                            return <Package2 className="w-6 h-6 text-white" />
                          } else {
                            const foundIcon = containerIcons.find(i => i.id === container.icon)
                            const iconValue = foundIcon?.icon
                            if (typeof iconValue === 'string') {
                              return <span>{iconValue}</span>
                            }
                            return <span>📦</span>
                          }
                        })()}
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            setEditingId(container.id)
                          }}
                          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                        >
                          <Edit2 className="w-4 h-4 text-gray-500" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(container.id)
                          }}
                          className="p-2 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      </div>
                    </div>

                    <h3 className="font-semibold text-lg text-gray-900 mb-1">
                      {container.name}
                    </h3>
                    
                    {container.description && (
                      <p className="text-sm text-gray-600 mb-3">
                        {container.description}
                      </p>
                    )}

                    <div className="flex items-center justify-between">
                      {container.location_name && (
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <MapPin className="w-4 h-4" />
                          <span>{container.location_name}</span>
                        </div>
                      )}
                      <div className="bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium">
                        {container.item_count} items
                      </div>
                    </div>
                  </>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Create Container Modal */}
      <AnimatePresence>
        {isCreating && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50"
            onClick={() => setIsCreating(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-white rounded-3xl p-6 max-w-md w-full shadow-xl"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-4">Create New Container</h3>
              
              <div className="space-y-4">
                {/* Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Container Name
                  </label>
                  <input
                    type="text"
                    value={newContainer.name}
                    onChange={(e) => setNewContainer({ ...newContainer, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                    placeholder="e.g., Winter Clothes Box"
                  />
                </div>

                {/* Description */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Description (optional)
                  </label>
                  <textarea
                    value={newContainer.description}
                    onChange={(e) => setNewContainer({ ...newContainer, description: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10 resize-none"
                    rows={2}
                    placeholder="What's in this container?"
                  />
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Location
                  </label>
                  <select
                    value={newContainer.location_id}
                    onChange={(e) => setNewContainer({ ...newContainer, location_id: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:border-amber-500 focus:ring-4 focus:ring-amber-500/10"
                  >
                    <option value="">Select a location</option>
                    {locations.map(loc => (
                      <option key={loc.id} value={loc.id}>{loc.name}</option>
                    ))}
                  </select>
                </div>

                {/* Icon */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Icon
                  </label>
                  <div className="grid grid-cols-4 gap-2">
                    {containerIcons.map(({ id, icon: Icon, name }) => (
                      <button
                        key={id}
                        type="button"
                        onClick={() => setNewContainer({ ...newContainer, icon: id })}
                        className={`p-3 rounded-lg border-2 transition-all ${
                          newContainer.icon === id
                            ? 'border-amber-500 bg-amber-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        {typeof Icon === 'string' ? (
                          <span className="text-2xl">{Icon}</span>
                        ) : (
                          <Icon className="w-6 h-6 mx-auto" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Color */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Color
                  </label>
                  <div className="grid grid-cols-8 gap-2">
                    {colors.map(color => (
                      <button
                        key={color}
                        type="button"
                        onClick={() => setNewContainer({ ...newContainer, color })}
                        className={`w-10 h-10 rounded-lg transition-all ${
                          newContainer.color === color
                            ? 'ring-2 ring-offset-2 ring-amber-500 scale-110'
                            : 'hover:scale-105'
                        }`}
                        style={{ backgroundColor: color }}
                      />
                    ))}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  onClick={handleCreate}
                  disabled={!newContainer.name}
                  className="flex-1 bg-gradient-to-r from-amber-400 to-yellow-500 text-gray-900 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50"
                >
                  Create Container
                </button>
                <button
                  onClick={() => setIsCreating(false)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-200 transition-all"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}